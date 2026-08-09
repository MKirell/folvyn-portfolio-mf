import type { ApiPortfolio } from '@/types/api'

export const SECTION_ORDER = [
  'hero',
  'about',
  'experience',
  'projects',
  'skills',
  'education',
  'achievements',
  'contact',
] as const

export type SectionKey = (typeof SECTION_ORDER)[number]

export interface RenderedSection {
  key: SectionKey
  tinted: boolean
}

const ALWAYS: SectionKey[] = ['hero', 'about', 'contact']

function hasContent(key: SectionKey, portfolio: ApiPortfolio): boolean {
  if (ALWAYS.includes(key)) return true

  switch (key) {
    case 'experience':
      return portfolio.experiences.length > 0
    case 'projects':
      return portfolio.projects.length > 0
    case 'skills':
      return portfolio.skillCategories.length > 0
    case 'education':
      return (
        portfolio.education.degrees.length > 0 ||
        portfolio.education.certifications.length > 0 ||
        portfolio.education.spokenLanguages.length > 0
      )
    case 'achievements':
      return (
        portfolio.achievements.volunteering.length > 0 || portfolio.achievements.awards.length > 0
      )
    default:
      return false
  }
}

export function renderedSections(portfolio: ApiPortfolio | null): RenderedSection[] {
  if (!portfolio) return []

  let position = 0

  return SECTION_ORDER.filter((key) => hasContent(key, portfolio)).map((key) => {
    if (key === 'hero') return { key, tinted: false }
    const tinted = position % 2 === 1
    position += 1
    return { key, tinted }
  })
}
