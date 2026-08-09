import { messagesFor } from '../i18n/messages'
import { totalExperienceMonths } from './period'
import type { StatKey } from '../i18n/types'
import type { ApiPortfolio } from '../types/api'

export interface DerivedStat {
  key: StatKey
  num: string
  anchor: string
  label: string
}

const ANCHORS: Record<StatKey, string> = {
  experience: '#experience',
  projects: '#projects',
  certifications: '#education',
  awards: '#achievements',
}

export function experienceYears(months: number): string {
  if (months <= 0) return '0'
  const years = Math.floor((months / 12) * 2) / 2
  return years < 0.5 ? '<1' : `${years}+`
}

export function deriveStats(portfolio: ApiPortfolio, lang: string): DerivedStat[] {
  const { stats } = messagesFor(lang)
  const counts: Record<StatKey, string> = {
    experience: experienceYears(totalExperienceMonths(portfolio.experiences)),
    projects: String(portfolio.projects.length),
    certifications: String(portfolio.education.certifications.length),
    awards: String(portfolio.achievements.awards.length),
  }

  return (Object.keys(ANCHORS) as StatKey[])
    .filter((key) => counts[key] !== '0')
    .map((key) => ({ key, num: counts[key], anchor: ANCHORS[key], label: stats[key] }))
}
