import { format, parseISO } from 'date-fns'

/** 1500000 -> "1 500 000 so'm" */
export function pul(n) {
  const son = Number(n || 0)
  return son.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm"
}

/** 1500000 -> "1 500 000" (birliksiz) */
export function son(n) {
  return Number(n || 0).toLocaleString('ru-RU').replace(/,/g, ' ')
}

/** ISO yoki Date -> "16.06.2026" */
export function sana(d) {
  if (!d) return '—'
  try {
    const date = typeof d === 'string' ? parseISO(d) : d
    return format(date, 'dd.MM.yyyy')
  } catch {
    return '—'
  }
}

export const OYLAR = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
]

export const HAFTA_KUNLARI = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya']

/** Brigada rang palitrasi */
export const RANGLAR = [
  '#3B82F6', // ko'k
  '#22C55E', // yashil
  '#F59E0B', // sariq
  '#EF4444', // qizil
  '#A855F7', // siyohrang
  '#EC4899', // pushti
  '#14B8A6', // turkuaz
  '#F97316', // to'q sariq
]

/** Status meta */
export const STATUSLAR = {
  zamer: { nom: 'Zamer', rang: '#A855F7' },
  tasdiq: { nom: 'Tasdiq', rang: '#3B82F6' },
  ishda: { nom: 'Ishda', rang: '#F59E0B' },
  tugadi: { nom: 'Tugadi', rang: '#22C55E' },
}

export const DAVOMAT_HOLATLARI = {
  keldi: { belgi: '✅', qiymat: 1, rang: '#22C55E' },
  yarim: { belgi: '½', qiymat: 0.5, rang: '#F59E0B' },
  kelmadi: { belgi: '❌', qiymat: 0, rang: '#EF4444' },
}
