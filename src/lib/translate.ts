export function fixProperNouns(text: string, targetLang: 'en' | 'ar'): string {
  if (!text) return text;
  let result = text;

  if (targetLang === 'en') {
    // English proper noun & institutional name rules
    result = result.replace(/House of Charity/gi, 'Rumah Amal');
    result = result.replace(/Charity House/gi, 'Rumah Amal');
    result = result.replace(/House of Deeds/gi, 'Rumah Amal');
    result = result.replace(/Deed House/gi, 'Rumah Amal');
    result = result.replace(/Amal House/gi, 'Rumah Amal');
    result = result.replace(/Syiah Kuala University/gi, 'Universitas Syiah Kuala (USK)');
    result = result.replace(/Jamik Mosque/gi, 'Masjid Jamik USK');
  } else if (targetLang === 'ar') {
    // Arabic proper noun & institutional name rules
    result = result.replace(/Charity House/gi, 'بيت المال (Rumah Amal)');
    result = result.replace(/House of Charity/gi, 'بيت المال (Rumah Amal)');
    result = result.replace(/دار الأعمال/g, 'بيت المال (Rumah Amal)');
    result = result.replace(/منزل الأعمال/g, 'بيت المال (Rumah Amal)');
    result = result.replace(/بيت الأعمال/g, 'بيت المال (Rumah Amal)');
    result = result.replace(/بيت صدقة/g, 'بيت المال (Rumah Amal)');
    result = result.replace(/روماه أمل/g, 'Rumah Amal USK');
    result = result.replace(/جامعة سياه كوالا/g, 'جامعة سياه كوالا (USK)');
    result = result.replace(/المسجد الجامع/g, 'المسجد الجامع (Masjid Jamik USK)');
  }

  return result;
}

export async function autoTranslate(
  text: string,
  targetLang: 'en' | 'ar',
  sourceLang: string = 'id'
): Promise<string> {
  if (!text || !text.trim()) return text;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );

    if (!res.ok) return text;

    const data = await res.json();
    let translated = text;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translated = data[0].map((item: any) => item[0] || '').join('');
    }

    return fixProperNouns(translated, targetLang);
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export async function autoTranslateAll(data: {
  title?: string;
  excerpt?: string;
  content?: string;
}) {
  const { title = '', excerpt = '', content = '' } = data;

  const [
    titleEn,
    titleAr,
    excerptEn,
    excerptAr,
    contentEn,
    contentAr,
  ] = await Promise.all([
    title ? autoTranslate(title, 'en') : Promise.resolve(''),
    title ? autoTranslate(title, 'ar') : Promise.resolve(''),
    excerpt ? autoTranslate(excerpt, 'en') : Promise.resolve(''),
    excerpt ? autoTranslate(excerpt, 'ar') : Promise.resolve(''),
    content ? autoTranslate(content, 'en') : Promise.resolve(''),
    content ? autoTranslate(content, 'ar') : Promise.resolve(''),
  ]);

  return {
    titleEn,
    titleAr,
    excerptEn,
    excerptAr,
    contentEn,
    contentAr,
  };
}
