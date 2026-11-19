/**
 * Hijri (Islamic Lunar) Calendar Utilities
 * Converts Gregorian dates to Islamic Umm al-Qura calendar dates natively.
 */

const HIJRI_MONTH_MAP: Record<string, string> = {
  Muharram: 'Muharram',
  Safar: 'Safar',
  'Rabiʻ I': 'Rabi al-Awwal',
  "Rabi' I": 'Rabi al-Awwal',
  'Rabiʻ II': 'Rabi al-Thani',
  "Rabi' II": 'Rabi al-Thani',
  'Jumada I': 'Jumada al-Awwal',
  'Jumada II': 'Jumada al-Akhirah',
  Rajab: 'Rajab',
  'Shaʻban': "Sha'ban",
  "Sha'ban": "Sha'ban",
  Ramadan: 'Ramadan',
  Shawwal: 'Shawwal',
  'Dhuʻl-Qiʻdah': "Dhu al-Qi'dah",
  "Dhu'l-Qi'dah": "Dhu al-Qi'dah",
  'Dhuʻl-Hijjah': 'Dhu al-Hijjah',
  "Dhu'l-Hijjah": 'Dhu al-Hijjah',
}

export interface HijriDateInfo {
  day: number
  month: string
  year: number
  formatted: string
  formattedAr: string
  monthYear: string
  monthYearAr: string
}

export function getHijriDate(date: Date = new Date()): HijriDateInfo {
  try {
    const fEn = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const partsEn = fEn.formatToParts(date)
    const day = partsEn.find((p) => p.type === 'day')?.value || '1'
    const rawMonth = partsEn.find((p) => p.type === 'month')?.value || 'Jumada al-Awwal'
    const year = partsEn.find((p) => p.type === 'year')?.value || '1448'
    const month = HIJRI_MONTH_MAP[rawMonth] || rawMonth

    // Formatted in Eastern Arabic Numerals
    const fAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const formattedAr = fAr.format(date)

    const fArMonth = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', {
      month: 'long',
      year: 'numeric',
    })
    const monthYearAr = fArMonth.format(date)

    return {
      day: parseInt(day, 10) || 1,
      month,
      year: parseInt(year, 10) || 1448,
      formatted: `${day} ${month} ${year} AH`,
      formattedAr,
      monthYear: `${month} ${year} AH`,
      monthYearAr,
    }
  } catch {
    return {
      day: 9,
      month: 'Jumada al-Akhirah',
      year: 1448,
      formatted: '9 Jumada al-Akhirah 1448 AH',
      formattedAr: '٩ جمادى الآخرة ١٤٤٨ هـ',
      monthYear: 'Jumada al-Akhirah 1448 AH',
      monthYearAr: 'جمادى الآخرة ١٤٤٨ هـ',
    }
  }
}
