/**
 * Message Gateway for sending OTP via WhatsApp.
 * Supports Fonnte (primary), Self-Hosted WhatsApp Gateway (Baileys/WPPConnect, only if WA_SELF_HOSTED_URL is set),
 * and Dev/Console Mock fallback.
 *
 * Priority:
 *   1. Fonnte API (if FONNTE_API_TOKEN is set) — safe, official Meta BSP
 *   2. Self-Hosted Gateway (only if WA_SELF_HOSTED_URL is explicitly set) — use with caution
 *   3. Dev Mock (console log, development only)
 */

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(toPhone: string, message: string): Promise<SendMessageResult> {
  const normalizedPhone = toPhone.replace(/[^\d]/g, '');

  // 1. Fonnte API — Primary (official Meta BSP, safe for production)
  const fonnteToken = process.env.FONNTE_API_TOKEN;
  if (fonnteToken) {
    try {
      const resFonnte = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: fonnteToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: normalizedPhone,
          message,
        }),
      });

      if (resFonnte.ok) {
        const jsonFonnte = await resFonnte.json();
        if (jsonFonnte.status) {
          console.log(`[Fonnte] ✅ OTP berhasil dikirim ke +${normalizedPhone}`);
          return { success: true, messageId: jsonFonnte.id || 'fonnte' };
        }
        console.error('[Fonnte Error]:', jsonFonnte);
      }
    } catch (fErr: any) {
      console.error('[Fonnte Fetch Error]:', fErr.message);
    }
  }

  // 2. Self-Hosted WhatsApp Gateway — only if WA_SELF_HOSTED_URL is explicitly set
  // ⚠️  WARNING: Using unofficial Baileys/WPPConnect may cause WA account to be banned.
  //              Only use this if you accept the risk or are using an official gateway.
  const selfHostedUrl = process.env.WA_SELF_HOSTED_URL;
  if (selfHostedUrl) {
    const selfHostedKey = process.env.WA_SELF_HOSTED_KEY || '';
    try {
      const res = await fetch(`${selfHostedUrl.replace(/\/$/, '')}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(selfHostedKey ? { Authorization: `Bearer ${selfHostedKey}` } : {}),
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          message,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        console.log(`[WA Self-Hosted] ✅ OTP berhasil dikirim ke +${normalizedPhone}`);
        return { success: true, messageId: json.messageId || 'wa-self-hosted' };
      }

      if (json?.error) {
        console.error('[WA Self-Hosted Error]:', json.error);
      }
    } catch (err: any) {
      console.error('[WA Self-Hosted Fetch Error]:', err.message);
    }
  }

  // 3. Fallback: Dev/Mock Console Logger (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n======================================================');
    console.log('📱 [WHATSAPP OTP GATEWAY - DEV MOCK (ALL GATEWAYS OFFLINE)]');
    console.log(`To      : +${normalizedPhone}`);
    console.log(`Content :\n${message}`);
    console.log('======================================================\n');
    return { success: true, messageId: 'mock-wa-id' };
  }

  throw new Error('Layanan WhatsApp Gateway sedang tidak tersedia. Silakan hubungi admin Rumah Amal USK.');
}
