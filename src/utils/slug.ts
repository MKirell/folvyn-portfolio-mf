export const PORTFOLIO_PREFIX = 'fol'

const CONFUSING = new Set([
  'admin',
  'api',
  'app',
  'assets',
  'auth',
  'console',
  'fol',
  'login',
  'www',
])

const SHAPE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function slugFromPath(pathname: string): string | null {
  const [prefix, candidate] = pathname.split('/').filter(Boolean)
  if (prefix !== PORTFOLIO_PREFIX || !candidate) return null

  const slug = decodeURIComponent(candidate).toLowerCase()
  if (CONFUSING.has(slug)) return null
  if (!SHAPE.test(slug)) return null
  if (slug.length < 3 || slug.length > 40) return null

  return slug
}

export function currentSlug(): string | null {
  return typeof location === 'undefined' ? null : slugFromPath(location.pathname)
}

export function portfolioPath(slug: string): string {
  return `/${PORTFOLIO_PREFIX}/${slug}`
}
