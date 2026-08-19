import type { ApiPortfolio } from '@/types/api'
import { buildJsonLd } from './jsonld'
import { describesTheCurrentShape } from './shape'
import { renderHeadTags } from './head'
import { renderSeoShell } from './shell'

export interface PageContext {
  siteUrl: string
  portfolioPrefix: string
  slug: string
  ogImage: string | null
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function addressOf(context: PageContext, lang?: string): string {
  const base = `${trimSlash(context.siteUrl)}/${context.portfolioPrefix}/${context.slug}`
  return lang ? `${base}/${lang}` : base
}

export function renderPage(shell: string, portfolio: ApiPortfolio, context: PageContext): string {
  const mismatch = describesTheCurrentShape(portfolio)
  if (mismatch) throw new Error(`the portfolio payload is not the shape this renders: ${mismatch}`)

  const alternates = [
    ...portfolio.availableLangs.map((locale) => ({
      lang: locale.code,
      href: addressOf(context, locale.code),
    })),
    { lang: 'x-default', href: addressOf(context) },
  ]

  const head = renderHeadTags(portfolio, JSON.stringify(buildJsonLd(portfolio)), {
    canonical: addressOf(context, portfolio.lang),
    ogImage: context.ogImage,
    alternates,
  })

  if (!shell.includes('<div id="app"></div>')) {
    throw new Error('the shell has no <div id="app"></div> to render into')
  }

  return shell
    .replace(
      '<div id="app"></div>',
      `<div id="app"><div id="seo-shell">${renderSeoShell(portfolio)}</div></div>`,
    )
    .replace(/<title>[^<]*<\/title>\s*/, '')
    .replace('</head>', `${head}</head>`)
    .replace(/<html\b[^>]*>/, `<html lang="${portfolio.lang}">`)
}
