import { KalkulatorPayload, KalkulatorResult, JenisZakat } from '@/types';

export interface NisabConfigInput {
  hargaEmasPerGram?: number;
  nisabEmasGram?: number;
  nisabProfesiBulan?: number;
}

export function hitungZakat(
  payload: KalkulatorPayload,
  config?: NisabConfigInput
): KalkulatorResult {
  const { jenis_zakat } = payload;

  const hargaEmasPerGram = config?.hargaEmasPerGram ?? 2_600_000;
  const nisabEmasGram = config?.nisabEmasGram ?? 94;
  const nisabProfesiBulan = config?.nisabProfesiBulan ?? 13_000_000;

  // Nisab Maal, Emas, Perniagaan, Perusahaan didasarkan pada Nisab Emas
  const nisabMaalRupiah = nisabEmasGram * hargaEmasPerGram;

  switch (jenis_zakat as JenisZakat) {
    case 'maal': {
      const totalHarta = Number(payload.total_harta || 0);
      const totalHutang = Number(payload.total_hutang || 0);
      const kebutuhan = Number(payload.total_kebutuhan || 0);
      const hartaBersih = totalHarta - totalHutang - kebutuhan;
      const mencapaiNisab = hartaBersih >= nisabMaalRupiah;
      return {
        mencapai_nisab: mencapaiNisab,
        jumlah_zakat: mencapaiNisab ? hartaBersih * 0.025 : 0,
        jenis_zakat: 'maal',
      };
    }

    case 'emas': {
      const beratEmas = Number(payload.berat_emas_gram || 0);
      const mencapaiNisab = beratEmas >= nisabEmasGram;
      const nilaiEmas = beratEmas * hargaEmasPerGram;
      return {
        mencapai_nisab: mencapaiNisab,
        jumlah_zakat: mencapaiNisab ? nilaiEmas * 0.025 : 0,
        jenis_zakat: 'emas',
      };
    }

    case 'profesi': {
      const penghasilan = Number(payload.penghasilan_bulan || 0);
      const bonus = Number(payload.bonus_tunjangan || 0);
      const hutang = Number(payload.total_hutang || 0);
      const kebutuhan = Number(payload.total_kebutuhan || 0);
      const totalPenghasilan = (penghasilan + bonus) - hutang - kebutuhan;
      const mencapaiNisab = totalPenghasilan >= nisabProfesiBulan;
      return {
        mencapai_nisab: mencapaiNisab,
        jumlah_zakat: mencapaiNisab ? totalPenghasilan * 0.025 : 0,
        jenis_zakat: 'profesi',
      };
    }

    case 'perniagaan': {
      const modal = Number(payload.modal_usaha || 0);
      const keuntungan = Number(payload.keuntungan || 0);
      const hutang = Number(payload.hutang_jangka_pendek || 0);
      const asetBersih = modal + keuntungan - hutang;
      const mencapaiNisab = asetBersih >= nisabMaalRupiah;
      return {
        mencapai_nisab: mencapaiNisab,
        jumlah_zakat: mencapaiNisab ? asetBersih * 0.025 : 0,
        jenis_zakat: 'perniagaan',
      };
    }

    case 'perusahaan': {
      if (payload.jenis_perusahaan === 'dagang_industri') {
        const asetLancar = Number(payload.aset_lancar || 0);
        const hutangLancar = Number(payload.hutang_lancar || 0);
        const asetBersih = asetLancar - hutangLancar;
        const mencapaiNisab = asetBersih >= nisabMaalRupiah;
        return {
          mencapai_nisab: mencapaiNisab,
          jumlah_zakat: mencapaiNisab ? asetBersih * 0.025 : 0,
          jenis_zakat: 'perusahaan',
        };
      } else {
        // jasa
        const laba = Number(payload.laba_sebelum_pajak || 0);
        const mencapaiNisab = laba >= nisabMaalRupiah;
        return {
          mencapai_nisab: mencapaiNisab,
          jumlah_zakat: mencapaiNisab ? laba * 0.1 : 0,
          jenis_zakat: 'perusahaan',
        };
      }
    }

    default:
      return {
        mencapai_nisab: false,
        jumlah_zakat: 0,
        jenis_zakat: jenis_zakat as JenisZakat,
      };
  }
}

// ---------------------------------------------------------------------------
// Zakat Pertanian
// ---------------------------------------------------------------------------
const NISAB_PERTANIAN_KG = 653;

export function hitungZakatPertanian(params: {
  jumlah_panen_kg: number;
  jenis_pengairan: 'irigasi' | 'hujan_sungai';
}): KalkulatorResult {
  const { jumlah_panen_kg, jenis_pengairan } = params;
  const tarif = jenis_pengairan === 'hujan_sungai' ? 0.1 : 0.05;
  const mencapai_nisab = jumlah_panen_kg >= NISAB_PERTANIAN_KG;
  const jumlah_zakat_kg = mencapai_nisab ? jumlah_panen_kg * tarif : 0;
  return {
    mencapai_nisab,
    jumlah_zakat: 0, // tidak dihitung dalam rupiah
    jumlah_zakat_kg,
    jenis_zakat: 'pertanian',
  };
}

// ---------------------------------------------------------------------------
// Zakat Peternakan — Kambing/Domba
// ---------------------------------------------------------------------------
function hitungZakatKambing(jumlah: number): { mencapai_nisab: boolean; pesan_ternak: string } {
  if (jumlah < 40) return { mencapai_nisab: false, pesan_ternak: '' };

  let ekor: number;
  if (jumlah <= 120) {
    ekor = 1;
  } else if (jumlah <= 200) {
    ekor = 2;
  } else if (jumlah <= 299) {
    ekor = 3;
  } else {
    // Setiap 100 ekor = 1 ekor kambing, dimulai dari 300
    ekor = Math.floor(jumlah / 100);
  }
  return { mencapai_nisab: true, pesan_ternak: `${ekor} ekor kambing` };
}

// ---------------------------------------------------------------------------
// Zakat Peternakan — Sapi/Kerbau
// ---------------------------------------------------------------------------
function hitungZakatSapiKerbau(jumlah: number): { mencapai_nisab: boolean; pesan_ternak: string } {
  if (jumlah < 30) return { mencapai_nisab: false, pesan_ternak: '' };

  // Tabel eksplisit 30–119
  const tabelEksplisit: Array<{ min: number; max: number; pesan: string }> = [
    { min: 30,  max: 39,  pesan: '1 ekor anak sapi/kerbau umur 1–2 tahun' },
    { min: 40,  max: 59,  pesan: '1 ekor anak sapi/kerbau umur 2–3 tahun' },
    { min: 60,  max: 69,  pesan: '2 ekor anak sapi/kerbau umur 1–2 tahun' },
    { min: 70,  max: 79,  pesan: '1 ekor umur 2–3 tahun + 1 ekor umur 1–2 tahun' },
    { min: 80,  max: 89,  pesan: '2 ekor anak sapi/kerbau umur 2–3 tahun' },
    { min: 90,  max: 99,  pesan: '3 ekor anak sapi/kerbau umur 1–2 tahun' },
    { min: 100, max: 109, pesan: '1 ekor umur 2–3 tahun + 2 ekor umur 1–2 tahun' },
    { min: 110, max: 119, pesan: '2 ekor umur 2–3 tahun + 1 ekor umur 1–2 tahun' },
  ];

  const cocok = tabelEksplisit.find((r) => jumlah >= r.min && jumlah <= r.max);
  if (cocok) return { mencapai_nisab: true, pesan_ternak: cocok.pesan };

  // Kaidah untuk >= 120: setiap 30 = 1 ekor (1–2 thn), setiap 40 = 1 ekor (2–3 thn)
  // Gunakan kombinasi yang menghasilkan jumlah kelipatan 30 & 40 terbesar
  let bestPesan = '';
  let bestTotal = -1;
  for (let a = 0; a * 30 <= jumlah; a++) {
    for (let b = 0; a * 30 + b * 40 <= jumlah; b++) {
      const used = a * 30 + b * 40;
      if (used > bestTotal && used <= jumlah) {
        bestTotal = used;
        const parts: string[] = [];
        if (b > 0) parts.push(`${b} ekor umur 2–3 tahun`);
        if (a > 0) parts.push(`${a} ekor umur 1–2 tahun`);
        bestPesan = parts.join(' + ');
      }
    }
  }
  return { mencapai_nisab: true, pesan_ternak: bestPesan || `${Math.floor(jumlah / 30)} ekor umur 1–2 tahun` };
}

export function hitungZakatPeternakan(params: {
  jumlah_ternak: number;
  jenis_ternak: 'kambing' | 'sapi_kerbau';
}): KalkulatorResult {
  const { jumlah_ternak, jenis_ternak } = params;
  const hasil =
    jenis_ternak === 'kambing'
      ? hitungZakatKambing(jumlah_ternak)
      : hitungZakatSapiKerbau(jumlah_ternak);
  return {
    mencapai_nisab: hasil.mencapai_nisab,
    jumlah_zakat: 0,
    pesan_ternak: hasil.pesan_ternak,
    jenis_zakat: 'peternakan',
  };
}

export function formatRupiah(angka: number): string {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}
