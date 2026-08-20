import type { ApiPortfolio } from '@/types/api'
import { fullName, languageName } from '@/utils/person'
import { formatPeriod } from '@/utils/period'
import { BRAND } from '@/config/app'
import { slugify, stripMarkdown, stripTrailingSlash } from './text'
import { parseCertDate, parseMonthYearRange, span } from './dates'
import { honorsLabel } from '@/utils/vocabularies'

type JsonLdNode = Record<string, unknown>
type OrgOptions = { type?: string; sameAs?: string | null }

export function buildJsonLd(portfolio: ApiPortfolio): JsonLdNode {
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
    ...(d.honors ? { description: honorsLabel(d.honors, portfolio.lang) } : {}),
    ...(d.doc ? { url: fileUrl(d.doc) } : {}),
    recognizedBy: orgRef(d.school, {
      type: 'EducationalOrganization',
      sameAs: d.link,
    }),
    ...span(d.startDate, d.endDate),
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
    ...span(v.startDate, v.endDate),
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
    dateCreated: p.startDate,
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
      name: languageName(l.code, portfolio.lang),
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
