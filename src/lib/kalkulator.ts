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

export function formatRupiah(angka: number): string {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}
