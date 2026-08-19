import type { ApiPortfolio } from '@/types/api'
import { messagesFor } from '@/i18n/messages'
import { contactBlurb, countryName, fullName, displayPhone, languageName } from '@/utils/person'
import { formatPeriod, formatSpan, formatYearSpan } from '@/utils/period'
import { honorsLabel } from '@/utils/vocabularies'
import { renderedSections, type SectionKey } from '@/utils/sections'
import { boldify, escapeHtml } from './text'

function textSpan(startDate: string, endDate: string | null): string {
  return formatSpan(startDate, endDate, 'en')
}

function group(label: string, items: string): string {
  if (!items) return ''
  return `<h3>${escapeHtml(label)}</h3>
    <ul>${items}</ul>`
}

export function renderSeoShell(data: ApiPortfolio): string {
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
        <p>${escapeHtml(textSpan(p.startDate, p.endDate))}</p>
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
    .map((l) => `<li>${escapeHtml(languageName(l.code, data.lang))} — ${escapeHtml(l.level)}</li>`)
    .join('')

  const degrees = education.degrees
    .map(
      (d) => `
      <li>${escapeHtml(d.title)}, ${escapeHtml(d.school)} (${escapeHtml(formatYearSpan(d.startDate, d.endDate, 'en'))})${
        d.honors ? ' — ' + escapeHtml(honorsLabel(d.honors, data.lang)) : ''
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
        <p>${escapeHtml(textSpan(v.startDate, v.endDate))}</p>
        <p>${boldify(v.desc)}</p>
      </li>`,
    )
    .join('')

  const awards = achievements.awards
    .map(
      (a) =>
        `<li>${escapeHtml(a.title)}${a.country ? ' — ' + escapeHtml(countryName(a.country, data.lang)) : ''}</li>`,
    )
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
    <p>${boldify(contactBlurb(person, ui))}</p>
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
