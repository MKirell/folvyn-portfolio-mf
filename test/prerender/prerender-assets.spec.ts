import { describe, expect, it } from 'vitest'
import { initialsOf } from '../../prerender/image/card'
import { renderSitemap } from '../../prerender/sitemap'
import type { ApiPortfolio } from '@/types/api'
import en from '../fixtures/portfolio.en.json'

const portfolio = en as unknown as ApiPortfolio

const CONTEXT = { siteUrl: 'https://folvyn.mkirell.com/', portfolioPrefix: 'fol' }

describe('the card falls back inside itself', () => {
  it('uses the initials of the person, not of the platform', () => {
    expect(initialsOf(portfolio)).toBe('AL')
  })

  it('still produces something when a name is missing', () => {
    const partial = {
      ...portfolio,
      person: { ...portfolio.person, givenName: '', familyName: '' },
    } as unknown as ApiPortfolio

    expect(initialsOf(partial)).toBe('G')
  })
})

describe('renderSitemap', () => {
  const xml = renderSitemap(
    [
      { slug: 'ada-lovelace', langs: ['en', 'fr'], updatedAt: '2026-08-09T10:00:00.000Z' },
      { slug: 'ada-lovelace', langs: ['en'], updatedAt: null },
    ],
    CONTEXT,
  )

  it('lists one canonical entry per portfolio, under the prefix', () => {
    expect(xml).toContain('<loc>https://folvyn.mkirell.com/fol/ada-lovelace</loc>')
    expect(xml).toContain('<loc>https://folvyn.mkirell.com/fol/ada-lovelace</loc>')
  })

  it('declares every locale as an alternate, plus x-default', () => {
    expect(xml).toContain('hreflang="en" href="https://folvyn.mkirell.com/fol/ada-lovelace/en"')
    expect(xml).toContain('hreflang="fr" href="https://folvyn.mkirell.com/fol/ada-lovelace/fr"')
    expect(xml).toContain('hreflang="x-default"')
  })

  it('carries a last-modified date only when there is one', () => {
    expect(xml).toContain('<lastmod>2026-08-09</lastmod>')
    expect(xml.match(/<lastmod>/g)).toHaveLength(1)
  })

  it('is well-formed and contains nothing unpublished', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('</urlset>')
    expect(xml).not.toContain('undefined')
  })

  it('escapes what it interpolates', () => {
    const risky = renderSitemap([{ slug: 'a&b', langs: ['en'] }], CONTEXT)

    expect(risky).toContain('a&amp;b')
    expect(risky).not.toMatch(/<loc>[^<]*&(?!amp;)/)
  })
})

describe('the card palette', () => {
  it('is the portfolio’s own, read from the stylesheet rather than restated', async () => {
    const { palette } = await import('../../prerender/image/tokens')
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const css = readFileSync(resolve(__dirname, '../../src/style.css'), 'utf8')
    const colours = palette()

    for (const [name, value] of Object.entries(colours)) {
      expect(css).toContain(value)
      expect(value).toMatch(/^#[0-9a-fA-F]{3,8}$/)
      expect(name).toBeTruthy()
    }
  })
})
