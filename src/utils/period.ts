import { messagesFor } from '../i18n/messages'
import { countryName } from './person'
import type { ApiExperience } from '../types/api'

const MONTHS_IN_YEAR = 12

export function monthsBetween(startDate: string, endDate: string | null): number {
  const [startYear, startMonth] = startDate.split('-').map(Number)
  const end = endDate ? endDate.split('-').map(Number) : null
  const now = new Date()
  const endYear = end ? end[0] : now.getFullYear()
  const endMonth = end ? end[1] : now.getMonth() + 1

  return Math.max(1, (endYear - startYear) * MONTHS_IN_YEAR + (endMonth - startMonth) + 1)
}

export function formatMonthShort(value: string, lang: string): string {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return value

  try {
    const name = new Intl.DateTimeFormat(lang, { month: 'short' }).format(
      new Date(Date.UTC(year, month - 1, 1)),
    )
    const short = name.replace(/\.$/, '').slice(0, 3)
    return `${short.charAt(0).toLocaleUpperCase(lang)}${short.slice(1)} ${year}`
  } catch {
    return value
  }
}

export function formatMonthLong(value: string, lang: string): string {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return value

  try {
    return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(
      new Date(Date.UTC(year, month - 1, 1)),
    )
  } catch {
    return value
  }
}

export function formatMonth(value: string): string {
  const [year, month] = value.split('-')
  return `${month}/${year}`
}

export function formatDuration(months: number, lang: string): string {
  const { period } = messagesFor(lang)
  if (months < MONTHS_IN_YEAR) {
    return `${months} ${months === 1 ? period.month : period.months}`
  }

  const years = Math.floor(months / MONTHS_IN_YEAR)
  const rest = months % MONTHS_IN_YEAR
  const yearPart = `${years} ${years === 1 ? period.year : period.years}`
  return rest === 0 ? yearPart : `${yearPart} ${rest} ${rest === 1 ? period.month : period.months}`
}

export function formatYear(value: string): string {
  return value.split('-')[0]
}

export function formatYearSpan(startDate: string, endDate: string | null, lang: string): string {
  const { period } = messagesFor(lang)
  const end = endDate ? formatYear(endDate) : period.present
  return `${formatYear(startDate)} — ${end}`
}

export function formatSpan(startDate: string, endDate: string | null, lang: string): string {
  const { period } = messagesFor(lang)
  const end = endDate ? formatMonth(endDate) : period.present
  return `${formatMonth(startDate)} — ${end}`
}

export function formatSpanWithDuration(
  startDate: string,
  endDate: string | null,
  lang: string,
): string {
  const duration = formatDuration(monthsBetween(startDate, endDate), lang)
  return `${formatSpan(startDate, endDate, lang)} · ${duration}`
}

export function formatPlace(
  country: string | null,
  city: string | null | undefined,
  lang: string,
): string {
  return [city, countryName(country, lang)].filter(Boolean).join(', ')
}

export function formatPeriod(experience: ApiExperience, lang: string): string {
  return [
    formatSpanWithDuration(experience.startDate, experience.endDate, lang),
    formatPlace(experience.country, experience.city, lang),
  ]
    .filter(Boolean)
    .join(' · ')
}

export function totalExperienceMonths(experiences: ApiExperience[]): number {
  return experiences.reduce(
    (total, experience) => total + monthsBetween(experience.startDate, experience.endDate),
    0,
  )
}
