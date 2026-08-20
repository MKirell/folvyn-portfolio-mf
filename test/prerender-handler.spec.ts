import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiPortfolio } from '@/types/api'
import en from './fixtures/portfolio.en.json'

const sent: { type: string; input: Record<string, unknown> }[] = []

vi.mock('@aws-sdk/client-s3', () => {
  class Command {
    constructor(public input: Record<string, unknown>) {}
  }
  return {
    S3Client: class {
      async send(command: Command & { constructor: { name: string } }) {
        sent.push({ type: command.constructor.name, input: command.input })
        if (command.constructor.name === 'GetObjectCommand') {
          return { Body: { transformToString: async () => SHELL } }
        }
        if (command.constructor.name === 'ListObjectsV2Command') {
          return {
            Contents: [
              { Key: 'portfolio/fol/ada-lovelace/index.html' },
              { Key: 'portfolio/fol/ada-lovelace/en/index.html' },
              { Key: 'portfolio/fol/ada-lovelace/fr/index.html' },
            ],
          }
        }
        return {}
      }
    },
    GetObjectCommand: class extends Command {},
    ListObjectsV2Command: class extends Command {},
    PutObjectCommand: class extends Command {},
    DeleteObjectCommand: class extends Command {},
  }
})

vi.mock('@aws-sdk/client-cloudfront', () => {
  class Command {
    constructor(public input: Record<string, unknown>) {}
  }
  return {
    CloudFrontClient: class {
      async send(command: Command & { constructor: { name: string } }) {
        sent.push({ type: command.constructor.name, input: command.input })
        return {}
      }
    },
    CreateInvalidationCommand: class extends Command {},
  }
})

vi.mock('../prerender/image/render', () => ({
  fetchPhoto: async () => null,
  renderCard: async () => Buffer.from('png'),
}))

const SHELL = '<!doctype html><html lang="en"><head></head><body><div id="app"></div></body></html>'

const portfolio = en as unknown as ApiPortfolio

const PUBLISHED = [
  { slug: 'ada-lovelace', langs: ['en', 'fr'], updatedAt: '2026-08-10T00:00:00.000Z' },
  { slug: 'grace-hopper', langs: ['en', 'fr'], updatedAt: '2026-08-11T00:00:00.000Z' },
]

function payloadFor(url: string): unknown {
  if (url.endsWith('/portfolio/published')) return PUBLISHED
  const slug = /\/portfolio\/([^?]+)/.exec(url)?.[1] ?? 'ada-lovelace'
  const lang = /lang=([a-z]+)/.exec(url)?.[1] ?? 'en'
  return { ...portfolio, lang, person: { ...portfolio.person, photo: null }, slug }
}

beforeEach(() => {
  sent.length = 0
  vi.stubEnv('API_BASE_URL', 'https://folvyn-dev.mkirell.com/api/v1')
  vi.stubEnv('SITE_URL', 'https://folvyn-dev.mkirell.com')
  vi.stubEnv('SPA_BUCKET', 'spa')
  vi.stubEnv('ASSETS_BUCKET', 'assets')
  vi.stubEnv('SHELL_PREFIX', 'portfolio')
  vi.stubEnv('PORTFOLIO_PREFIX', 'fol')
  vi.stubEnv('CLOUDFRONT_DISTRIBUTION_ID', 'E123')

  vi.stubGlobal('fetch', async (url: string) => ({
    ok: true,
    status: 200,
    json: async () => payloadFor(String(url)),
  }))
})

function pagesWritten(): string[] {
  return sent
    .filter((call) => call.type === 'PutObjectCommand' && call.input.Bucket === 'spa')
    .map((call) => String(call.input.Key))
}

describe('the renderer, asked for everything', () => {
  it('renders every published portfolio, which is what a deploy asks for', async () => {
    const { handler } = await import('../prerender/handler')
    const result = await handler({})

    for (const entry of PUBLISHED) {
      expect(pagesWritten()).toContain(`portfolio/fol/${entry.slug}/index.html`)
      expect(pagesWritten()).toContain(`portfolio/fol/${entry.slug}/en/index.html`)
      expect(pagesWritten()).toContain(`portfolio/fol/${entry.slug}/fr/index.html`)
    }

    expect(result.slug).toBeNull()
    expect(result.sitemap).toBe(PUBLISHED.length)
  })

  it('writes the sitemap once, not once per portfolio', async () => {
    const { handler } = await import('../prerender/handler')
    await handler({})

    const sitemaps = sent.filter(
      (call) => call.type === 'PutObjectCommand' && call.input.Key === 'sitemap.xml',
    )
    expect(sitemaps).toHaveLength(1)
  })

  it('invalidates once, because invalidation paths are metered', async () => {
    const { handler } = await import('../prerender/handler')
    await handler({})

    const invalidations = sent.filter((call) => call.type === 'CreateInvalidationCommand')
    expect(invalidations).toHaveLength(1)
  })
})

describe('the renderer, asked for one portfolio', () => {
  it('renders only the slug it was given', async () => {
    const { handler } = await import('../prerender/handler')
    const result = await handler({ slug: 'ada-lovelace' })

    expect(pagesWritten()).toContain('portfolio/fol/ada-lovelace/index.html')
    expect(pagesWritten().some((key) => key.includes('grace-hopper'))).toBe(false)
    expect(result.slug).toBe('ada-lovelace')
  })

  it('removes the page rather than rendering it when the portfolio is gone', async () => {
    const { handler } = await import('../prerender/handler')
    await handler({ slug: 'ada-lovelace', removed: true })

    const deleted = sent
      .filter((call) => call.type === 'DeleteObjectCommand')
      .map((call) => String(call.input.Key))

    expect(deleted).toContain('portfolio/fol/ada-lovelace/index.html')
    expect(deleted).toContain('portfolio/fol/ada-lovelace/en/index.html')
    expect(deleted).toContain('portfolio/fol/ada-lovelace/fr/index.html')
    expect(pagesWritten().some((key) => key.endsWith('ada-lovelace/index.html'))).toBe(false)
  })
})
