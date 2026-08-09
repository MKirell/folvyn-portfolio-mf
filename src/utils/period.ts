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

export function formatPeriod(experience: ApiExperience, lang: string): string {
  const { period } = messagesFor(lang)
  const end = experience.endDate ? formatMonth(experience.endDate) : period.present
  const duration = formatDuration(monthsBetween(experience.startDate, experience.endDate), lang)
  const where = countryName(experience.country, lang)

  return [`${formatMonth(experience.startDate)} — ${end}`, duration, where]
    .filter(Boolean)
    .join(' · ')
}

export function totalExperienceMonths(experiences: ApiExperience[]): number {
  return experiences.reduce(
    (total, experience) => total + monthsBetween(experience.startDate, experience.endDate),
    0,
  )
}
