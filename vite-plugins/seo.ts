import type { Plugin } from 'vite'
import { BRAND } from '../src/brand'
import type { ApiPortfolio } from '../src/types/api'
import { messagesFor } from '../src/i18n/messages'
import { fullName, displayPhone } from '../src/utils/person'
import { formatPeriod } from '../src/utils/period'
import { renderedSections, type SectionKey } from '../src/utils/sections'

type JsonLdNode = Record<string, unknown>
type OrgOptions = { type?: string; sameAs?: string | null }

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}
async function loadPortfolio(baseUrl: string): Promise<ApiPortfolio> {
  const url = `${baseUrl.replace(/\/+$/, '')}/portfolio`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`SEO metadata needs ${url}, which responded ${response.status}`)
  }

  return (await response.json()) as ApiPortfolio
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

function escapeHtml(str: unknown = ''): string {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(str: unknown = ''): string {
  return escapeHtml(str).replace(/"/g, '&quot;')
}

function stripMarkdown(str: unknown = ''): string {
  return String(str).replace(/\*\*(.+?)\*\*/g, '$1')
}

function boldify(str: unknown = ''): string {
  return escapeHtml(str).replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-ink font-semibold">$1</strong>',
  )
}

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

function slugify(str: unknown = ''): string {
  return String(str)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseMonthYearRange(period = ''): { startDate?: string; endDate?: string } {
  const m = period.match(/(\d{2})\/(\d{4})\s*—\s*(?:(\d{2})\/(\d{4})|Present)/)
  if (!m) return {}
  const [, sm, sy, em, ey] = m
  return em && ey
    ? { startDate: `${sy}-${sm}`, endDate: `${ey}-${em}` }
    : { startDate: `${sy}-${sm}` }
}

function parseYearRange(years = ''): { startDate?: string; endDate?: string } {
  const m = years.match(/(\d{4})(?:\s*—\s*(\d{4}))?/)
  if (!m) return {}
  return { startDate: m[1], endDate: m[2] || m[1] }
}

function parseCertDate(dateStr = ''): string | undefined {
  const m = dateStr.match(/([A-Za-z]{3})\w*\s+(\d{4})/)
  if (!m) return undefined
  const month = MONTHS[m[1].toLowerCase()]
  return month ? `${m[2]}-${String(month).padStart(2, '0')}` : m[2]
}

function parseProjectDate(period = ''): string | undefined {
  const mmYear = period.match(/^(\d{2})\/(\d{4})/)
  if (mmYear) return `${mmYear[2]}-${mmYear[1]}`
  const yearOnly = period.match(/(\d{4})/)
  return yearOnly ? yearOnly[1] : undefined
}

function buildJsonLd(portfolio: ApiPortfolio): JsonLdNode {
  const { person, profile, experiences, skillCategories, education, achievements } = portfolio
  const projectItems = portfolio.projects
  const base = stripTrailingSlash(person.url)
  const id = (frag: string): string => `${base}/${frag}`
  const fileUrl = (name: string | null | undefined): string | undefined =>
    name ? `${base}/files/${name}` : undefined

  const orgs = new Map<string, JsonLdNode>()
  function orgRef(
    name: string | null | undefined,
    { type = 'Organization', sameAs }: OrgOptions = {},
  ): { '@id': string } | undefined {
    if (!name) return undefined
    const slug = `org-${slugify(name)}`
    if (!orgs.has(slug)) {
      orgs.set(slug, {
        '@type': type,
        '@id': id(`#${slug}`),
        name,
        ...(sameAs ? { sameAs } : {}),
      })
    }
    return { '@id': id(`#${slug}`) }
  }

  const worksFor = experiences.map((job) => ({
    '@type': 'EmployeeRole',
    roleName: job.role,
    description: job.bullets.map(stripMarkdown).join(' '),
    worksFor: orgRef(job.company, { sameAs: job.link }),
    ...parseMonthYearRange(formatPeriod(job, portfolio.lang)),
  }))

  const alumniOf = [
    ...new Map(
      education.degrees
        .map((d) =>
          orgRef(d.school, {
            type: 'EducationalOrganization',
            sameAs: d.link,
          }),
        )
        .filter((ref): ref is { '@id': string } => Boolean(ref))
        .map((ref) => [ref['@id'], ref] as const),
    ).values(),
  ]

  const degreeCredentials = education.degrees.map((d) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'degree',
    name: d.title,
    ...(d.mention ? { description: stripMarkdown(d.mention) } : {}),
    ...(d.doc ? { url: fileUrl(d.doc) } : {}),
    recognizedBy: orgRef(d.school, {
      type: 'EducationalOrganization',
      sameAs: d.link,
    }),
    ...parseYearRange(d.years),
  }))

  const certCredentials = education.certifications.map((c) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'certification',
    name: c.title,
    ...(c.doc ? { url: fileUrl(c.doc) } : {}),
    recognizedBy: orgRef(c.issuer),
    dateCreated: parseCertDate(c.date),
  }))

  const memberOf = achievements.volunteering.map((v) => ({
    '@type': 'OrganizationRole',
    roleName: v.role,
    description: stripMarkdown(v.desc),
    memberOf: orgRef(v.org, { sameAs: v.link }),
    ...parseMonthYearRange(v.period),
  }))

  const projectNodes = projectItems.map((p) => ({
    '@type': 'SoftwareApplication',
    '@id': id(`#project-${slugify(p.title)}`),
    name: p.title,
    ...(p.link ? { url: p.link } : {}),
    author: { '@id': id('#person') },
    description: stripMarkdown(p.desc),
    applicationCategory: 'Artificial Intelligence',
    operatingSystem: 'Linux',
    keywords: p.tags.join(', '),
    dateCreated: parseProjectDate(p.period),
    applicationSubCategory: p.badge,
  }))

  const personNode = {
    '@type': 'Person',
    '@id': id('#person'),
    name: fullName(person),
    givenName: person.givenName,
    familyName: person.familyName,
    jobTitle: person.headline,
    email: `mailto:${person.email}`,
    telephone: person.phone,
    url: person.url,
    sameAs: [person.linkedin, person.github].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      addressLocality: person.city,
      addressCountry: person.country,
    },
    description: stripMarkdown(profile.tagline),
    knowsAbout: [...new Set(skillCategories.flatMap((c) => c.tags))],
    knowsLanguage: education.spokenLanguages.map((l) => ({
      '@type': 'Language',
      name: l.name,
      description: l.level,
    })),
    worksFor,
    alumniOf,
    hasCredential: [...degreeCredentials, ...certCredentials],
    award: achievements.awards.map((a) => a.title),
    memberOf,
  }

  const website = {
    '@type': 'WebSite',
    '@id': id('#website'),
    url: person.url,
    name: BRAND,
    inLanguage: portfolio.availableLangs.map((l) => l.code),
    publisher: { '@id': id('#person') },
  }

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': id('#webpage'),
    url: person.url,
    name: fullName(person),
    description: stripMarkdown(profile.tagline),
    inLanguage: portfolio.availableLangs.map((l) => l.code),
    isPartOf: { '@id': id('#website') },
    mainEntity: { '@id': id('#person') },
  }

  return {
    '@context': { '@vocab': 'https://schema.org/' },
    '@graph': [website, profilePage, personNode, ...projectNodes, ...orgs.values()],
  }
}

function group(label: string, items: string): string {
  if (!items) return ''
  return `<h3>${escapeHtml(label)}</h3>
    <ul>${items}</ul>`
}

function renderSeoShell(data: ApiPortfolio): string {
  const { person, profile, experiences, skillCategories, education, achievements } = data
  const ui = messagesFor(data.lang)
  const name = fullName(person)
  const projectItems = data.projects

  const experience = experiences
    .map(
      (job) => `
      <li>
        <h3>${escapeHtml(job.role)} — ${escapeHtml(job.company)}</h3>
        <p>${escapeHtml(formatPeriod(job, data.lang))}</p>
        <ul>${job.bullets.map((b) => `<li>${boldify(b)}</li>`).join('')}</ul>
        <p>${job.tags.map(escapeHtml).join(', ')}</p>
      </li>`,
    )
    .join('')

  const projectsHtml = projectItems
    .map(
      (p) => `
      <li>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.period)}</p>
        <p>${boldify(p.desc)}</p>
        <p>${p.tags.map(escapeHtml).join(', ')}</p>
        ${p.link ? `<a href="${escapeHtml(p.link)}">${escapeHtml(p.link)}</a>` : ''}
      </li>`,
    )
    .join('')

  const skills = skillCategories
    .map(
      (c) => `
      <li>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${c.tags.map(escapeHtml).join(', ')}</p>
      </li>`,
    )
    .join('')

  const languages = education.spokenLanguages
    .map((l) => `<li>${escapeHtml(l.name)} — ${escapeHtml(l.level)}</li>`)
    .join('')

  const degrees = education.degrees
    .map(
      (d) => `
      <li>${escapeHtml(d.title)}, ${escapeHtml(d.school)} (${escapeHtml(d.years)})${
        d.mention ? ' — ' + escapeHtml(d.mention) : ''
      }</li>`,
    )
    .join('')

  const certs = education.certifications
    .map((c) => `<li>${escapeHtml(c.title)} — ${escapeHtml(c.issuer)} (${escapeHtml(c.date)})</li>`)
    .join('')

  const vols = achievements.volunteering
    .map(
      (v) => `
      <li>
        <h3>${escapeHtml(v.role)} — ${escapeHtml(v.org)}</h3>
        <p>${escapeHtml(v.period)}</p>
        <p>${boldify(v.desc)}</p>
      </li>`,
    )
    .join('')

  const awards = achievements.awards
    .map((a) => `<li>${escapeHtml(a.title)}${a.place ? ' — ' + escapeHtml(a.place) : ''}</li>`)
    .join('')

  const blocks: Record<SectionKey, string> = {
    hero: `
  <section id="hero">
    <h1>${escapeHtml(name)}</h1>
    <p>${escapeHtml(person.headline)} at ${escapeHtml(person.affiliation)}</p>
    <p>${boldify(profile.tagline)}</p>
  </section>`,
    about: `
  <section id="about">
    <h2>${escapeHtml(ui.headings.about)}</h2>
    ${person.aboutParagraphs.map((p) => `<p>${boldify(p)}</p>`).join('')}
  </section>`,
    experience: `
  <section id="experience">
    <h2>${escapeHtml(ui.headings.experience)}</h2>
    <ul>${experience}</ul>
  </section>`,
    projects: `
  <section id="projects">
    <h2>${escapeHtml(ui.headings.projects)}</h2>
    <ul>${projectsHtml}</ul>
  </section>`,
    skills: `
  <section id="skills">
    <h2>${escapeHtml(ui.headings.skills)}</h2>
    <ul>${skills}</ul>
  </section>`,
    education: `
  <section id="education">
    <h2>${escapeHtml(ui.headings.education)}</h2>
    ${group(ui.labels.degrees, degrees)}
    ${group(ui.labels.certifications, certs)}
    ${group(ui.labels.spokenLanguages, languages)}
  </section>`,
    achievements: `
  <section id="achievements">
    <h2>${escapeHtml(ui.headings.achievements)}</h2>
    ${group(ui.labels.volunteering, vols)}
    ${group(ui.labels.awards, awards)}
  </section>`,
    contact: `
  <section id="contact">
    <h2>${escapeHtml(ui.headings.contact)}</h2>
    <p>${boldify(person.contactDesc)}</p>
    <ul>
      <li>Email: <a href="mailto:${escapeHtml(person.email)}">${escapeHtml(person.email)}</a></li>
      <li>Phone: <a href="tel:${escapeHtml(person.phone)}">${escapeHtml(displayPhone(person.phone))}</a></li>
      <li>LinkedIn: <a href="${escapeHtml(person.linkedin)}">${escapeHtml(person.linkedin)}</a></li>
      <li>Location: ${escapeHtml(person.city)}</li>
    </ul>
  </section>`,
  }

  const present = renderedSections(data).map((entry) => entry.key)

  const links = present
    .filter((key) => key !== 'hero')
    .map((key) => `    <a href="#${key}">${escapeHtml(ui.nav[key])}</a>`)
    .join('\n')

  return `
<a href="#main-content" class="skip-link">Skip to main content</a>
<header>
  <nav aria-label="Main navigation">
${links}
  </nav>
</header>
<main id="main-content">${present.map((key) => blocks[key]).join('')}
</main>
<footer>© ${new Date().getFullYear()} ${escapeHtml(name)}</footer>`
}

function renderHeadTags(portfolio: ApiPortfolio, jsonld: string): string {
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
  const ogImage = `${stripTrailingSlash(person.url)}/icons/og-image.png`
  const attr = escapeAttr

  return `
<style>#seo-shell{display:none}</style>
<noscript><style>#seo-shell{display:block}</style></noscript>
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${attr(description)}" />
<meta name="keywords" content="${attr(keywords)}" />
<meta name="author" content="${attr(name)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="theme-color" content="#14161b" />
<link rel="canonical" href="${attr(person.url)}" />
<link rel="me" href="${attr(person.linkedin)}" />
<link rel="me" href="${attr(person.github)}" />
<link rel="alternate" hreflang="en" href="${attr(person.url)}?lang=en" />
<link rel="alternate" hreflang="fr" href="${attr(person.url)}?lang=fr" />
<link rel="alternate" hreflang="x-default" href="${attr(person.url)}" />
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="${attr(BRAND)}" />
<meta property="og:title" content="${attr(pageTitle)}" />
<meta property="og:description" content="${attr(description)}" />
<meta property="og:url" content="${attr(person.url)}" />
<meta property="og:image" content="${attr(ogImage)}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="2400" />
<meta property="og:image:height" content="1260" />
<meta property="og:image:alt" content="${attr(nameRole)}" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="fr_FR" />
<meta property="profile:first_name" content="${attr(person.givenName)}" />
<meta property="profile:last_name" content="${attr(person.familyName)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${attr(pageTitle)}" />
<meta name="twitter:description" content="${attr(description)}" />
<meta name="twitter:image" content="${attr(ogImage)}" />
<script type="application/ld+json">${jsonld}</script>
`
}

function describesTheCurrentShape(portfolio: ApiPortfolio): string {
  if (!portfolio?.person?.givenName) return 'person.givenName is missing'
  if (!portfolio.profile?.tagline) return 'profile is missing'
  const undated = portfolio.experiences?.find((job) => !job.startDate)
  if (undated) return `experience "${undated.company}" has no startDate`
  return ''
}

export default function seoPrerender(): Plugin {
  let baseUrl = ''

  return {
    name: 'seo-prerender',
    configResolved(config) {
      baseUrl = String(config.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1')
    },
    async transformIndexHtml(html: string) {
      const skip = (reason: string): string => {
        console.warn(`[seo-prerender] skipped — ${reason}`)
        return html
      }

      let portfolio: ApiPortfolio
      try {
        portfolio = await loadPortfolio(baseUrl)
      } catch (error) {
        return skip((error as Error).message)
      }

      const mismatch = describesTheCurrentShape(portfolio)
      if (mismatch) return skip(`${baseUrl} answered an older payload: ${mismatch}`)

      try {
        const jsonld = JSON.stringify(buildJsonLd(portfolio))
        let out = html.replace(
          '<div id="app"></div>',
          `<div id="app"><div id="seo-shell">${renderSeoShell(portfolio)}</div></div>`,
        )
        out = out.replace(/<title>[^<]*<\/title>\s*/, '')
        out = out.replace('</head>', `${renderHeadTags(portfolio, jsonld)}</head>`)
        return out
      } catch (error) {
        return skip((error as Error).message)
      }
    },
  }
}
