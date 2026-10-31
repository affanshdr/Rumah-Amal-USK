import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/otp/message-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp tujuan dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage(phone.trim(), message.trim());

    return NextResponse.json({
      success: true,
      message: `Pesan berhasil dikirim via ${result.provider === 'fonnte' ? 'Fonnte' : (result.provider || 'WhatsApp Gateway')}!`,
      messageId: result.messageId,
      provider: result.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Gagal mengirim pesan uji coba.',
      },
      { status: 500 }
    );
  }
}
