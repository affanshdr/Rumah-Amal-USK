export type ProgramLanguage = 'id' | 'en' | 'ar';

export const CATEGORIES_RAW = [
  'SEMUA',
  'PENDIDIKAN',
  'PEMBERDAYAAN',
  'SOSIAL & KEMANUSIAAN',
  'SYIAR & QURBAN',
  'KEMITRAAN',
  'FASILITATOR & RELAWAN',
];

export const CATEGORIES_TRANSLATED: Record<ProgramLanguage, Record<string, string>> = {
  id: {
    'SEMUA': 'SEMUA',
    'PENDIDIKAN': 'PENDIDIKAN',
    'PEMBERDAYAAN': 'PEMBERDAYAAN',
    'SOSIAL & KEMANUSIAAN': 'SOSIAL & KEMANUSIAAN',
    'SYIAR & QURBAN': 'SYIAR & QURBAN',
    'KEMITRAAN': 'KEMITRAAN',
    'FASILITATOR & RELAWAN': 'FASILITATOR & RELAWAN',
  },
  en: {
    'SEMUA': 'ALL CATEGORIES',
    'PENDIDIKAN': 'EDUCATION',
    'PEMBERDAYAAN': 'EMPOWERMENT',
    'SOSIAL & KEMANUSIAAN': 'SOCIAL & HUMANITARIAN',
    'SYIAR & QURBAN': 'DAW\'AH & QURBAN',
    'KEMITRAAN': 'PARTNERSHIP',
    'FASILITATOR & RELAWAN': 'FACILITATOR & VOLUNTEER',
  },
  ar: {
    'SEMUA': 'جميع الفئات',
    'PENDIDIKAN': 'التعليم',
    'PEMBERDAYAAN': 'التمكين',
    'SOSIAL & KEMANUSIAAN': 'اجتماعي وإنساني',
    'SYIAR & QURBAN': 'الدعوة والأضاحي',
    'KEMITRAAN': 'الشراكة',
    'FASILITATOR & RELAWAN': 'الميسرون والمتطوعون',
  },
};

export const programDictionary = {
  id: {
    home: 'Beranda',
    program: 'Program',
    pageTitle: 'PROGRAM RUMAH AMAL USK',
    notFoundTitle: 'Program tidak ditemukan',
    notFoundCategory: 'Belum ada program untuk kategori',
    notFoundEmpty: 'Belum ada program yang dipublikasikan.',
    prev: '< Sebelumnya',
    next: 'Selanjutnya >',
  },
  en: {
    home: 'Home',
    program: 'Programs',
    pageTitle: 'RUMAH AMAL USK PROGRAMS',
    notFoundTitle: 'No programs found',
    notFoundCategory: 'No programs available for category',
    notFoundEmpty: 'No programs have been published yet.',
    prev: '< Previous',
    next: 'Next >',
  },
  ar: {
    home: 'الرئيسية',
    program: 'البرامج',
    pageTitle: 'برامج Rumah Amal USK',
    notFoundTitle: 'لم يتم العثور على برامج',
    notFoundCategory: 'لا توجد برامج متوفرة لهذه الفئة',
    notFoundEmpty: 'لم يتم نشر أي برامج بعد.',
    prev: '< السابق',
    next: 'التالي >',
  },
};
