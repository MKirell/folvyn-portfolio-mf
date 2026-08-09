export interface ApiLocale {
  code: string
  label: string
  flagCode: string
}

export interface ApiPerson {
  id: string
  givenName: string
  familyName: string
  email: string
  phone: string
  linkedin: string
  github: string
  url: string
  affiliation: string
  city: string
  country: string
  photo: string
  headline: string
  aboutParagraphs: string[]
  contactDesc: string
  resume: string | null
}

export interface ApiProfile {
  subtitles: string[]
  tagline: string
  highlights: string[]
  highlightFocus: string[]
}

export interface ApiExperience {
  id: string
  order: number
  current: boolean
  startDate: string
  endDate: string | null
  country: string | null
  company: string
  tags: string[]
  doc: string | null
  link: string | null
  role: string
  bullets: string[]
}

export interface ApiProject {
  id: string
  order: number
  title: string
  tags: string[]
  link: string | null
  period: string
  badge: string
  desc: string
}

export interface ApiSkillCategory {
  id: string
  order: number
  icon: string
  accentTags: string[]
  tags: string[]
  title: string
}

export interface ApiDegree {
  id: string
  order: number
  years: string
  doc: string | null
  link: string | null
  title: string
  school: string | null
  location: string | null
  mention: string | null
}

export interface ApiCertification {
  id: string
  order: number
  icon: string
  title: string
  issuer: string
  doc: string | null
  date: string
}

export interface ApiSpokenLanguage {
  id: string
  order: number
  flagCode: string
  pct: number
  doc: string | null
  name: string
  level: string
}

export interface ApiVolunteering {
  id: string
  order: number
  org: string
  doc: string | null
  link: string | null
  role: string
  period: string
  desc: string
}

export interface ApiAward {
  id: string
  order: number
  icon: string
  flagCode: string | null
  images: string[]
  doc: string | null
  title: string
  place: string | null
  date: string | null
}

export interface ApiPortfolio {
  lang: string
  consentMode: string
  availableLangs: ApiLocale[]
  assetPrefix: string
  person: ApiPerson
  profile: ApiProfile
  experiences: ApiExperience[]
  projects: ApiProject[]
  skillCategories: ApiSkillCategory[]
  education: {
    degrees: ApiDegree[]
    certifications: ApiCertification[]
    spokenLanguages: ApiSpokenLanguage[]
  }
  achievements: {
    volunteering: ApiVolunteering[]
    awards: ApiAward[]
  }
}
