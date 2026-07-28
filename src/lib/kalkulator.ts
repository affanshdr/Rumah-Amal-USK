import { KalkulatorPayload, KalkulatorResult, JenisZakat } from '@/types';

// Nisab dalam Rupiah (2.5% dari 94 gram emas, harga emas ~Rp 1.200.000/gram)
const NISAB_MAAL = 94 * 1_200_000;
const HARGA_EMAS_PER_GRAM = 1_200_000;
const NISAB_EMAS_GRAM = 94;

// Nisab profesi berdasarkan SK DPS BMA No. 02/2024
const NISAB_PROFESI_BULAN = 10_500_000;

export function hitungZakat(payload: KalkulatorPayload): KalkulatorResult {
  const { jenis_zakat } = payload;

  switch (jenis_zakat as JenisZakat) {
    case 'maal': {
      const totalHarta = Number(payload.total_harta || 0);
      const totalHutang = Number(payload.total_hutang || 0);
      const hartaBersih = totalHarta - totalHutang;
      const mencapaiNisab = hartaBersih >= NISAB_MAAL;
      return {
        mencapai_nisab: mencapaiNisab,
        jumlah_zakat: mencapaiNisab ? hartaBersih * 0.025 : 0,
        jenis_zakat: 'maal',
      };
    }

    case 'emas': {
      const beratEmas = Number(payload.berat_emas_gram || 0);
      const mencapaiNisab = beratEmas >= NISAB_EMAS_GRAM;
      const nilaiEmas = beratEmas * HARGA_EMAS_PER_GRAM;
      return {
        mencapai_nisab: mencapaiNisab,
        jumlah_zakat: mencapaiNisab ? nilaiEmas * 0.025 : 0,
        jenis_zakat: 'emas',
      };
    }

    case 'profesi': {
      const penghasilan = Number(payload.penghasilan_bulan || 0);
      const bonus = Number(payload.bonus_tunjangan || 0);
      const totalPenghasilan = penghasilan + bonus;
      const mencapaiNisab = totalPenghasilan >= NISAB_PROFESI_BULAN;
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
      const mencapaiNisab = asetBersih >= NISAB_MAAL;
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
        const mencapaiNisab = asetBersih >= NISAB_MAAL;
        return {
          mencapai_nisab: mencapaiNisab,
          jumlah_zakat: mencapaiNisab ? asetBersih * 0.025 : 0,
          jenis_zakat: 'perusahaan',
        };
      } else {
        // jasa
        const laba = Number(payload.laba_sebelum_pajak || 0);
        const mencapaiNisab = laba >= NISAB_MAAL;
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
