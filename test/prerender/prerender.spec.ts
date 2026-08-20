import { describe, expect, it } from 'vitest'
import { addressOf, renderPage } from '../../prerender/html/page'
import type { ApiPortfolio } from '@/types/api'
import en from '../fixtures/portfolio.en.json'

const SHELL = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Folvyn Portfolio</title></head>
<body><div id="app"></div><script type="module" src="/app/portfolio/assets/main.js"></script></body>
</html>`

const CONTEXT = {
  siteUrl: 'https://folvyn.mkirell.com',
  portfolioPrefix: 'fol',
  slug: 'ada-lovelace',
  ogImage: 'https://folvyn.mkirell.com/og/ada-lovelace-en.png',
}

const portfolio = en as unknown as ApiPortfolio

describe('addressOf', () => {
  it('is the portfolio address, and the locale is a segment under it', () => {
    expect(addressOf(CONTEXT)).toBe('https://folvyn.mkirell.com/fol/ada-lovelace')
    expect(addressOf(CONTEXT, 'fr')).toBe('https://folvyn.mkirell.com/fol/ada-lovelace/fr')
  })
})

describe('renderPage', () => {
  const html = renderPage(SHELL, portfolio, CONTEXT)

  it('keeps the shell so the SPA still hydrates over it', () => {
    expect(html).toContain('/app/portfolio/assets/main.js')
    expect(html).toContain('<div id="app">')
  })

  it('renders the whole portfolio for a crawler with no JavaScript', () => {
    expect(html).toContain('id="seo-shell"')
    expect(html).toContain(String(portfolio.person.givenName))
    expect(html).toContain(String(portfolio.projects[0].title))
  })

  it('points the canonical at the locale actually rendered', () => {
    expect(html).toContain(
      '<link rel="canonical" href="https://folvyn.mkirell.com/fol/ada-lovelace/en" />',
    )
  })

  it('declares one alternate per locale, plus x-default', () => {
    for (const locale of portfolio.availableLangs) {
      expect(html).toContain(`hreflang="${locale.code}"`)
    }
    expect(html).toContain('hreflang="x-default"')
  })

  it('carries the generated card, never another portfolio’s', () => {
    expect(html).toContain(`content="${CONTEXT.ogImage}"`)
    expect(html).not.toContain('og-image.png')
  })

  it('describes the card for a reader and for a search engine alike', () => {
    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
    expect(html).toContain('twitter:description')
    expect(html).toContain('<meta name="description"')
  })

  it('emits no og:image at all when the card could not be rendered', () => {
    const without = renderPage(SHELL, portfolio, { ...CONTEXT, ogImage: null })

    expect(without).not.toContain('og:image')
    expect(without).toContain('og:title')
  })

  it('sets the document language to the locale rendered', () => {
    expect(html).toMatch(/<html lang="en">/)
    expect(renderPage(SHELL, { ...portfolio, lang: 'fr' }, CONTEXT)).toMatch(/<html lang="fr">/)
  })

  it('carries a JSON-LD graph', () => {
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)

    expect(match).not.toBeNull()
    expect(() => JSON.parse(match![1])).not.toThrow()
  })

  it('refuses a payload that is not the shape it renders', () => {
    const broken = { ...portfolio, profile: {} } as unknown as ApiPortfolio

    expect(() => renderPage(SHELL, broken, CONTEXT)).toThrow(/not the shape/)
  })

  it('refuses a shell it cannot render into', () => {
    expect(() => renderPage('<html><body></body></html>', portfolio, CONTEXT)).toThrow(/no <div/)
  })
})
