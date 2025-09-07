import dayjs from 'dayjs'
import 'dayjs/locale/he'

export type Locale = 'en' | 'he'

export const locales: Locale[] = ['en', 'he']

export const defaultLocale: Locale = 'en'

// Number formatting
export const formatNumber = (value: number, locale: Locale = defaultLocale): string => {
  return new Intl.NumberFormat(locale).format(value)
}

export const formatDecimal = (value: number, decimals: number = 2, locale: Locale = defaultLocale): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export const formatScientific = (value: number, locale: Locale = defaultLocale): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'scientific',
    maximumSignificantDigits: 3
  }).format(value)
}

// Date formatting
export const formatDate = (date: Date | string, locale: Locale = defaultLocale): string => {
  const d = dayjs(date)
  if (locale === 'he') {
    d.locale('he')
  }
  return d.format('DD/MM/YYYY')
}

export const formatDateTime = (date: Date | string, locale: Locale = defaultLocale): string => {
  const d = dayjs(date)
  if (locale === 'he') {
    d.locale('he')
  }
  return d.format('DD/MM/YYYY HH:mm')
}

export const formatMonth = (date: Date | string, locale: Locale = defaultLocale): string => {
  const d = dayjs(date)
  if (locale === 'he') {
    d.locale('he')
  }
  return d.format('MMM YYYY')
}

// Units
export const formatUnit = (value: number, unit: string, locale: Locale = defaultLocale): string => {
  return `${formatNumber(value, locale)} ${unit}`
}

export const formatConcentration = (value: number, locale: Locale = defaultLocale): string => {
  return formatUnit(value, 'μM', locale)
}

export const formatBiomass = (value: number, locale: Locale = defaultLocale): string => {
  return formatUnit(value, 'mmol P/m³', locale)
}

// RTL support
export const isRTL = (locale: Locale): boolean => {
  return locale === 'he'
}
