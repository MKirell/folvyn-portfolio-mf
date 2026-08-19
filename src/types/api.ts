export interface ApiLocale {
  code: string
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
  resume: string | null
}

export interface ApiProfile {
  subtitles: string[]
  tagline: string
}

export interface ApiExperience {
  id: string
  order: number
  startDate: string
  endDate: string | null
  country: string | null
  city: string | null
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
  startDate: string
  endDate: string | null
  title: string
  tags: string[]
  link: string | null
  badge: string
  desc: string
}

export interface ApiSkillCategory {
  id: string
  order: number
  icon: string
  tags: string[]
  accentTags: string[]
  title: string
}

export interface ApiDegree {
  id: string
  order: number
  startDate: string
  endDate: string | null
  school: string | null
  country: string | null
  city: string | null
  honors: string | null
  doc: string | null
  link: string | null
  title: string
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
  code: string
  country: string
  level: string
  pct: number
  doc: string | null
}

export interface ApiVolunteering {
  id: string
  order: number
  startDate: string
  endDate: string | null
  org: string
  doc: string | null
  link: string | null
  role: string
  desc: string
}

export interface ApiAward {
  id: string
  order: number
  icon: string
  country: string | null
  city: string | null
  date: string | null
  images: string[]
  title: string
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
