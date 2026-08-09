export type SectionKey =
  'about' | 'experience' | 'projects' | 'skills' | 'education' | 'achievements' | 'contact'

export type StatKey = 'experience' | 'projects' | 'certifications' | 'awards'

export interface ShellHelpItem {
  cmd: string
  desc: string
}

export interface Messages {
  nav: Record<SectionKey, string>
  headings: Record<SectionKey, string>
  consent: {
    title: string
    body: string
    accept: string
    refuse: string
    note: string
    change: string
  }
  labels: {
    currentRole: string
    showMore: string
    showLess: string
    earlierRoles: string
    privacy: string
    terms: string
    degrees: string
    certifications: string
    spokenLanguages: string
    volunteering: string
    awards: string
    email: string
    phone: string
    linkedin: string
    location: string
    contactCta: string
  }
  hero: {
    cta: { projects: string; contact: string }
    card: { headline: string; affiliation: string; location: string; languages: string }
  }
  stats: Record<StatKey, string>
  period: {
    present: string
    month: string
    months: string
    year: string
    years: string
  }
  footer: string
  shell: {
    promptUser: string
    promptHost: string
    placeholder: string
    welcome: string[]
    helpIntro: string
    helpItems: ShellHelpItem[]
    helpFooter: string
    messages: Record<string, string>
  }
}
