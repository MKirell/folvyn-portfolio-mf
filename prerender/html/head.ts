import type { ApiPortfolio } from '@/types/api'
import { fullName } from '@/utils/person'
import { BRAND } from '@/brand'
import { OG_HEIGHT, OG_SCALE, OG_WIDTH } from '../og'
import { escapeAttr, escapeHtml, stripMarkdown } from './text'

export interface HeadContext {
  canonical: string
  ogImage: string | null
  alternates: { lang: string; href: string }[]
}

function ogLocale(lang: string): string {
  const region: Record<string, string> = {
    en: 'US',
    fr: 'FR',
    ar: 'TN',
    nl: 'NL',
    de: 'DE',
    es: 'ES',
  }
  return `${lang}_${region[lang] ?? lang.toUpperCase()}`
}

export function renderHeadTags(
  portfolio: ApiPortfolio,
  jsonld: string,
  context: HeadContext,
): string {
  const { person, profile, skillCategories } = portfolio
  const name = fullName(person)
  const pageTitle = `${name} | ${BRAND}`
  const nameRole = `${name} — ${person.headline}`
  const description = stripMarkdown(profile.tagline)
  const keywords = [
    name,
    person.headline,
    person.affiliation,
    ...new Set(skillCategories.flatMap((c) => c.accentTags)),
  ].join(', ')
  const attr = escapeAttr

  const alternates = context.alternates
    .map((alt) => `<link rel="alternate" hreflang="${attr(alt.lang)}" href="${attr(alt.href)}" />`)
    .join('\n')

  const alternateLocales = portfolio.availableLangs
    .filter((locale) => locale.code !== portfolio.lang)
    .map(
      (locale) =>
        `<meta property="og:locale:alternate" content="${attr(ogLocale(locale.code))}" />`,
    )
    .join('\n')

  const image = context.ogImage
    ? `<meta property="og:image" content="${attr(context.ogImage)}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="${OG_WIDTH * OG_SCALE}" />
<meta property="og:image:height" content="${OG_HEIGHT * OG_SCALE}" />
<meta property="og:image:alt" content="${attr(nameRole)}" />
<meta name="twitter:image" content="${attr(context.ogImage)}" />`
    : ''

  return `
<style>#seo-shell{display:none}</style>
<noscript><style>#seo-shell{display:block}</style></noscript>
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${attr(description)}" />
<meta name="keywords" content="${attr(keywords)}" />
<meta name="author" content="${attr(name)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="theme-color" content="#14161b" />
<link rel="canonical" href="${attr(context.canonical)}" />
<link rel="me" href="${attr(person.linkedin)}" />
<link rel="me" href="${attr(person.github)}" />
${alternates}
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="${attr(BRAND)}" />
<meta property="og:title" content="${attr(pageTitle)}" />
<meta property="og:url" content="${attr(context.canonical)}" />
${image}
<meta property="og:locale" content="${attr(ogLocale(portfolio.lang))}" />
${alternateLocales}
<meta property="profile:first_name" content="${attr(person.givenName)}" />
<meta property="profile:last_name" content="${attr(person.familyName)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${attr(pageTitle)}" />
<script type="application/ld+json">${jsonld}</script>
`
}
