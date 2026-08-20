import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { ApiPortfolio } from '@/types/api'
import { addressOf, renderPage, type PageContext } from './html/page'
import { fetchPhoto, renderCard } from './image/render'
import { renderSitemap, type SitemapEntry } from './sitemap'

export interface PrerenderEvent {
  slug?: string
  removed?: boolean
}

export interface PrerenderResult {
  slug: string | null
  written: string[]
  card: 'rendered' | 'skipped' | 'failed'
  sitemap: number
}

interface Settings {
  apiBaseUrl: string
  siteUrl: string
  spaBucket: string
  assetsBucket: string
  shellPrefix: string
  portfolioPrefix: string
  assetsBaseUrl: string
  distributionId: string
  region: string
}

const SEPARATE_INVALIDATION_PATHS = 15

const REQUIRED = [
  'API_BASE_URL',
  'SITE_URL',
  'SPA_BUCKET',
  'ASSETS_BUCKET',
  'SHELL_PREFIX',
  'PORTFOLIO_PREFIX',
] as const

function settings(): Settings {
  const missing = REQUIRED.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`the renderer is missing ${missing.join(', ')}`)
  }

  const trim = (value: string): string => value.replace(/\/+$/, '')

  return {
    apiBaseUrl: trim(process.env.API_BASE_URL as string),
    siteUrl: trim(process.env.SITE_URL as string),
    spaBucket: process.env.SPA_BUCKET as string,
    assetsBucket: process.env.ASSETS_BUCKET as string,
    shellPrefix: process.env.SHELL_PREFIX as string,
    portfolioPrefix: process.env.PORTFOLIO_PREFIX as string,
    assetsBaseUrl: trim(process.env.ASSETS_BASE_URL ?? (process.env.SITE_URL as string)),
    distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID ?? '',
    region: process.env.AWS_REGION ?? 'eu-west-3',
  }
}

function assetUrl(config: Settings, folder: string, prefix: string, filename: string): string {
  const owner = prefix.replace(/^\/+|\/+$/g, '')
  return `${config.assetsBaseUrl}/${folder}/${owner ? `${owner}/` : ''}${filename}`
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return (await response.json()) as T
}

async function readShell(s3: S3Client, bucket: string, key: string): Promise<string> {
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  const body = await object.Body?.transformToString()

  if (!body) throw new Error(`s3://${bucket}/${key} is empty`)
  return body
}

async function readPublished(config: Settings): Promise<SitemapEntry[]> {
  return getJson<SitemapEntry[]>(`${config.apiBaseUrl}/portfolio/published`)
}

async function writeSitemap(
  s3: S3Client,
  config: Settings,
  entries?: SitemapEntry[],
): Promise<number> {
  const published = entries ?? (await readPublished(config))

  await s3.send(
    new PutObjectCommand({
      Bucket: config.spaBucket,
      Key: 'sitemap.xml',
      Body: renderSitemap(published, {
        siteUrl: config.siteUrl,
        portfolioPrefix: config.portfolioPrefix,
      }),
      ContentType: 'application/xml; charset=utf-8',
      CacheControl: 'public,max-age=0,s-maxage=3600,must-revalidate',
    }),
  )

  return published.length
}

async function invalidate(config: Settings, paths: string[]): Promise<void> {
  if (!config.distributionId) return

  await new CloudFrontClient({ region: 'us-east-1' }).send(
    new CreateInvalidationCommand({
      DistributionId: config.distributionId,
      InvalidationBatch: {
        CallerReference: `prerender-${Date.now()}`,
        Paths: { Quantity: paths.length, Items: paths },
      },
    }),
  )
}

async function renderPortfolio(
  s3: S3Client,
  config: Settings,
  slug: string,
  shell: string,
): Promise<{ written: string[]; card: PrerenderResult['card'] }> {
  const prefix = `${config.shellPrefix}/${config.portfolioPrefix}/${slug}`
  const first = await getJson<ApiPortfolio>(
    `${config.apiBaseUrl}/portfolio/${encodeURIComponent(slug)}`,
  )
  const languages = first.availableLangs.map((locale) => locale.code)

  const context: PageContext = {
    siteUrl: config.siteUrl,
    portfolioPrefix: config.portfolioPrefix,
    slug,
    ogImage: null,
  }

  let card: PrerenderResult['card'] = 'skipped'
  const pages: { key: string; html: string }[] = []

  for (const lang of languages) {
    const portfolio =
      lang === first.lang
        ? first
        : await getJson<ApiPortfolio>(
            `${config.apiBaseUrl}/portfolio/${encodeURIComponent(slug)}?lang=${lang}`,
          )

    let ogImage: string | null = null

    try {
      const photoName = portfolio.person.photo
      const photo = photoName
        ? await fetchPhoto(assetUrl(config, 'imgs', portfolio.assetPrefix, photoName))
        : null

      const png = await renderCard(portfolio, photo)
      const key = `og/${slug}-${lang}.png`

      await s3.send(
        new PutObjectCommand({
          Bucket: config.assetsBucket,
          Key: key,
          Body: png,
          ContentType: 'image/png',
          CacheControl: 'public,max-age=0,s-maxage=86400,must-revalidate',
        }),
      )

      ogImage = `${config.assetsBaseUrl}/${key}`
      card = 'rendered'
    } catch (error) {
      card = 'failed'
      console.error(`[prerender] the card for ${slug} ${lang} failed: ${(error as Error).message}`)
    }

    const html = renderPage(shell, portfolio, { ...context, ogImage })
    pages.push({ key: `${prefix}/${lang}/index.html`, html })
    if (lang === first.lang) pages.push({ key: `${prefix}/index.html`, html })
  }

  await Promise.all(
    pages.map((page) =>
      s3.send(
        new PutObjectCommand({
          Bucket: config.spaBucket,
          Key: page.key,
          Body: page.html,
          ContentType: 'text/html; charset=utf-8',
          CacheControl: 'public,max-age=0,s-maxage=300,must-revalidate',
        }),
      ),
    ),
  )

  return { written: pages.map((page) => page.key), card }
}

async function pruneUnpublished(
  s3: S3Client,
  config: Settings,
  published: string[],
): Promise<string[]> {
  const root = `${config.shellPrefix}/${config.portfolioPrefix}/`
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: config.spaBucket, Prefix: root }))

  const keep = new Set(published)
  const stale = (listed.Contents ?? []).filter((object) => {
    const slug = String(object.Key).slice(root.length).split('/')[0]
    return slug.length > 0 && !keep.has(slug)
  })

  await Promise.all(
    stale.map((object) =>
      s3.send(new DeleteObjectCommand({ Bucket: config.spaBucket, Key: object.Key as string })),
    ),
  )

  return stale.map((object) => String(object.Key))
}

async function renderEverything(s3: S3Client, config: Settings): Promise<PrerenderResult> {
  const published = await readPublished(config)
  const shell = await readShell(s3, config.spaBucket, `${config.shellPrefix}/index.html`)

  const written: string[] = []
  let card: PrerenderResult['card'] = published.length === 0 ? 'skipped' : 'rendered'

  for (const entry of published) {
    try {
      const result = await renderPortfolio(s3, config, entry.slug, shell)
      written.push(...result.written)
      if (result.card === 'failed') card = 'failed'
    } catch (error) {
      card = 'failed'
      console.error(`[prerender] ${entry.slug} failed: ${(error as Error).message}`)
    }
  }

  written.push(
    ...(await pruneUnpublished(
      s3,
      config,
      published.map((entry) => entry.slug),
    )),
  )

  const sitemap = await writeSitemap(s3, config, published)

  const paths =
    published.length > SEPARATE_INVALIDATION_PATHS
      ? [`/${config.portfolioPrefix}/*`]
      : published.map((entry) => `/${config.portfolioPrefix}/${entry.slug}*`)

  await invalidate(config, [...paths, '/og/*', '/sitemap.xml'])

  return { slug: null, written, card, sitemap }
}

export async function handler(event: PrerenderEvent): Promise<PrerenderResult> {
  const config = settings()
  const s3 = new S3Client({ region: config.region })
  const slug = event.slug?.trim() ?? null

  if (!slug) return renderEverything(s3, config)

  if (event.removed) {
    const prefix = `${config.shellPrefix}/${config.portfolioPrefix}/${slug}`
    const stale = await s3.send(
      new ListObjectsV2Command({ Bucket: config.spaBucket, Prefix: `${prefix}/` }),
    )

    await Promise.all(
      (stale.Contents ?? []).map((object) =>
        s3.send(new DeleteObjectCommand({ Bucket: config.spaBucket, Key: object.Key as string })),
      ),
    )

    const sitemap = await writeSitemap(s3, config)
    await invalidate(config, [
      `/${config.portfolioPrefix}/${slug}*`,
      `/og/${slug}-*`,
      '/sitemap.xml',
    ])
    return { slug, written: [], card: 'skipped', sitemap }
  }

  const shell = await readShell(s3, config.spaBucket, `${config.shellPrefix}/index.html`)
  const { written, card } = await renderPortfolio(s3, config, slug, shell)

  const context: PageContext = {
    siteUrl: config.siteUrl,
    portfolioPrefix: config.portfolioPrefix,
    slug,
    ogImage: null,
  }

  const sitemap = await writeSitemap(s3, config)
  await invalidate(config, [
    `${addressOf(context).slice(config.siteUrl.length)}*`,
    `/og/${slug}-*`,
    '/sitemap.xml',
  ])

  return { slug, written, card, sitemap }
}
