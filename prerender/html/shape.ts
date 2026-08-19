import type { ApiPortfolio } from '@/types/api'

export function describesTheCurrentShape(portfolio: ApiPortfolio): string {
  if (!portfolio?.person?.givenName) return 'person.givenName is missing'
  if (!portfolio.profile?.tagline) return 'profile is missing'
  const undated = portfolio.experiences?.find((job) => !job.startDate)
  if (undated) return `experience "${undated.company}" has no startDate`
  return ''
}
