import { NextResponse } from 'next/server';

export async function GET() {
  const fonnteToken = process.env.FONNTE_API_TOKEN?.trim();

  // 1. Cek konfigurasi token
  if (!fonnteToken) {
    return NextResponse.json({
      status: 'not_configured',
      isWhatsAppActive: false,
      error: 'FONNTE_API_TOKEN belum diatur di file .env',
      checkedAt: new Date().toISOString(),
    });
  }

  // 2. Ambil data device & kuota dari API Fonnte
  try {
    const res = await fetch('https://api.fonnte.com/device', {
      method: 'POST',
      headers: {
        Authorization: fonnteToken,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);

    if (json && json.status) {
      // device_status dari Fonnte adalah 'connect' atau 'disconnect'
      const isConnect = json.device_status === 'connect';

      return NextResponse.json({
        status: isConnect ? 'connected' : 'disconnected',
        isWhatsAppActive: isConnect,
        deviceStatus: json.device_status, // 'connect' | 'disconnect'
        device: json.device || null,
        name: json.name || 'Fonnte Device',
        quota: json.quota ?? null,
        package: json.package || null,
        expired: json.expired || null,
        messages: json.messages ?? null,
        error: isConnect
          ? null
          : 'Nomor WhatsApp belum terhubung / belum login di Fonnte. Silakan scan QR di web fonnte.com.',
        checkedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: 'error',
      isWhatsAppActive: false,
      error: json?.reason || 'Token Fonnte tidak valid atau tidak ditemukan.',
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'offline',
      isWhatsAppActive: false,
      error: `Gagal menghubungi server Fonnte: ${err.message}`,
      checkedAt: new Date().toISOString(),
    });
  }
}
