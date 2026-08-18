export type SidebarLanguage = 'id' | 'en' | 'ar';

export const sidebarDictionary: Record<SidebarLanguage, {
  zakat: string;
  infaq: string;
  riwayat: string;
  kalkulator: string;
}> = {
  id: {
    zakat: "Zakat",
    infaq: "Infaq",
    riwayat: "Cek Riwayat Pembayaran",
    kalkulator: "Kalkulator Zakat",
  },
  en: {
    zakat: "Zakat",
    infaq: "Infaq",
    riwayat: "Check Payment History",
    kalkulator: "Zakat Calculator",
  },
  ar: {
    zakat: "الزكاة",
    infaq: "الإنفاق",
    riwayat: "سجل الدفع",
    kalkulator: "حاسبة الزكاة",
  },
};
