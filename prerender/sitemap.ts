export interface SitemapEntry {
  slug: string
  langs: string[]
  updatedAt?: string | null
}

export interface SitemapContext {
  siteUrl: string
  portfolioPrefix: string
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderSitemap(entries: SitemapEntry[], context: SitemapContext): string {
  const base = context.siteUrl.replace(/\/+$/, '')
  const address = (slug: string, lang?: string): string =>
    `${base}/${context.portfolioPrefix}/${slug}${lang ? `/${lang}` : ''}`

  const urls = entries
    .map((entry) => {
      const alternates = [
        ...entry.langs.map((lang) => ({ hreflang: lang, href: address(entry.slug, lang) })),
        { hreflang: 'x-default', href: address(entry.slug) },
      ]
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />`,
        )
        .join('\n')

      const lastmod = entry.updatedAt
        ? `\n    <lastmod>${escapeXml(new Date(entry.updatedAt).toISOString().slice(0, 10))}</lastmod>`
        : ''

      return `  <url>
    <loc>${escapeXml(address(entry.slug))}</loc>${lastmod}
${alternates}
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
}
