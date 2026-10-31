/**
 * Message Gateway for sending OTP via WhatsApp.
 * Supports Fonnte (Primary Cloud API), Self-Hosted WhatsApp Gateway (Baileys/WPPConnect fallback),
 * and Dev/Console Mock fallback.
 *
 * Priority:
 *   1. Fonnte API (if FONNTE_API_TOKEN is set) — Recommended, official WhatsApp Gateway cloud API
 *   2. Self-Hosted Gateway (only if WA_SELF_HOSTED_URL is explicitly set)
 *   3. Dev Mock (console log, development only)
 */

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'fonnte' | 'self-hosted' | 'mock';
}

export async function sendWhatsAppMessage(toPhone: string, message: string): Promise<SendMessageResult> {
  const normalizedPhone = toPhone.replace(/[^\d]/g, '');

  // 1. Fonnte API — Primary Cloud Gateway
  const fonnteToken = process.env.FONNTE_API_TOKEN?.trim();
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
          countryCode: '62',
        }),
      });

      const jsonFonnte = await resFonnte.json().catch(() => null);

      if (resFonnte.ok && jsonFonnte?.status) {
        console.log(`[Fonnte] ✅ OTP/WhatsApp berhasil dikirim ke +${normalizedPhone} (ID: ${jsonFonnte.id || 'N/A'})`);
        return {
          success: true,
          messageId: String(jsonFonnte.id || 'fonnte'),
          provider: 'fonnte',
        };
      }

      const errMsg = jsonFonnte?.reason || jsonFonnte?.message || `Fonnte HTTP ${resFonnte.status}`;
      console.error('[Fonnte Error]:', errMsg, jsonFonnte);
      throw new Error(`[Fonnte Error] ${errMsg}`);
    } catch (fErr: any) {
      console.error('[Fonnte Fetch Exception]:', fErr.message);
      if (fErr.message?.startsWith('[Fonnte Error]')) {
        throw fErr;
      }
      throw new Error(`Gagal menghubungi API Fonnte: ${fErr.message}`);
    }
  }

  // 2. Self-Hosted WhatsApp Gateway — fallback jika WA_SELF_HOSTED_URL diset
  const selfHostedUrl = process.env.WA_SELF_HOSTED_URL?.trim();
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
        return {
          success: true,
          messageId: json.messageId || 'wa-self-hosted',
          provider: 'self-hosted',
        };
      }

      if (json?.error) {
        console.error('[WA Self-Hosted Error]:', json.error);
        throw new Error(`[WA Gateway Error] ${json.error}`);
      }
    } catch (err: any) {
      console.error('[WA Self-Hosted Fetch Error]:', err.message);
      if (err.message?.startsWith('[WA Gateway Error]')) {
        throw err;
      }
    }
  }

  // 3. Fallback: Dev/Mock Console Logger (hanya untuk development ketika gateway belum diset)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n======================================================');
    console.log('📱 [WHATSAPP OTP GATEWAY - DEV MOCK]');
    console.log(`To      : +${normalizedPhone}`);
    console.log(`Content :\n${message}`);
    console.log('Catatan : Pasang FONNTE_API_TOKEN di .env untuk kirim pesan riil via Fonnte.');
    console.log('======================================================\n');
    return {
      success: true,
      messageId: 'mock-wa-id',
      provider: 'mock',
    };
  }

  throw new Error('Layanan WhatsApp OTP belum dikonfigurasi. Harap atur FONNTE_API_TOKEN di file .env.');
}
