import { describe, expect, it } from 'vitest'
import {
  contactBlurb,
  countryName,
  displayPhone,
  fullName,
  languageName,
  linkedinHandle,
  mapsUrl,
} from '@/utils/person'
import { brandLogo } from '@/utils/logo'
import { deriveStats, experienceYears } from '@/utils/stats'
import { messagesFor } from '@/i18n/messages'
import type { ApiPortfolio } from '@/types/api'

describe('fullName', () => {
  it('joins the two halves, and copes when one is missing', () => {
    expect(fullName({ givenName: 'Ada', familyName: 'Lovelace' })).toBe('Ada Lovelace')
    expect(fullName({ givenName: 'Ada', familyName: '' })).toBe('Ada')
    expect(fullName({ givenName: '', familyName: '' })).toBe('')
  })
})

describe('displayPhone', () => {
  it('groups the national part in pairs behind the calling code', () => {
    expect(displayPhone('+33612345678')).toBe('+33 6 12 34 56 78')
  })

  it('leaves a number it cannot recognise exactly as written', () => {
    expect(displayPhone('0612345678')).toBe('0612345678')
    expect(displayPhone('not a number')).toBe('not a number')
  })

  it('does not treat the calling code alone as a whole number', () => {
    expect(displayPhone('+33')).toBe('+33')
  })
})

describe('linkedinHandle', () => {
  it('is the path, without the slashes around it', () => {
    expect(linkedinHandle('https://www.linkedin.com/in/ada-lovelace/')).toBe('in/ada-lovelace')
  })

  it('gives back whatever it was handed when that is not a URL', () => {
    expect(linkedinHandle('ada-lovelace')).toBe('ada-lovelace')
  })
})

describe('names of languages and countries', () => {
  it('reads a code in the visitor’s own language, capitalised', () => {
    expect(languageName('fr', 'en')).toBe('French')
    expect(languageName('fr', 'fr')).toBe('Français')
    expect(countryName('FR', 'en')).toBe('France')
  })

  it('reads nothing back for nothing', () => {
    expect(languageName(null, 'en')).toBe('')
    expect(countryName(null, 'en')).toBe('')
  })

  it('falls back to the code rather than throwing on a bad one', () => {
    expect(languageName('zz-not-a-tag!', 'en')).toBe('zz-not-a-tag!')
    expect(countryName('zz-not-a-tag!', 'en')).toBe('zz-not-a-tag!')
  })
})

describe('mapsUrl', () => {
  it('asks for the city and the country together', () => {
    expect(mapsUrl('Paris', 'FR', 'en')).toContain(encodeURIComponent('Paris, France'))
  })

  it('asks for the city alone when there is no country', () => {
    expect(mapsUrl('Paris', null)).toContain(encodeURIComponent('Paris'))
    expect(mapsUrl('Paris', null)).not.toContain(',')
  })
})

describe('contactBlurb', () => {
  const messages = messagesFor('en')

  it('names the role and the organisation when both are known', () => {
    const text = contactBlurb({ headline: 'Engineer', affiliation: 'Acme' }, messages)

    expect(text).toContain('Engineer')
    expect(text).toContain('Acme')
  })

  it('names the role alone when there is no organisation', () => {
    const text = contactBlurb({ headline: 'Engineer', affiliation: '' }, messages)

    expect(text).toContain('Engineer')
    expect(text).not.toContain('Acme')
  })

  it('says something plain when neither is known', () => {
    expect(contactBlurb({ headline: '', affiliation: '' }, messages)).toBe(
      messages.labels.contactBlurbPlain,
    )
  })
})

describe('brandLogo', () => {
  it('picks a different mark for each theme', () => {
    expect(brandLogo(true)).not.toBe(brandLogo(false))
  })
})

describe('experienceYears', () => {
  it('rounds down to the nearest half year, and marks a short one', () => {
    expect(experienceYears(0)).toBe('0')
    expect(experienceYears(-4)).toBe('0')
    expect(experienceYears(4)).toBe('<1')
    expect(experienceYears(6)).toBe('0.5+')
    expect(experienceYears(30)).toBe('2.5+')
  })
})

describe('deriveStats', () => {
  const portfolio = {
    experiences: [{ startDate: '2024-01', endDate: '2026-01' }],
    projects: [{ id: 'p' }],
    education: { certifications: [{ id: 'c' }], degrees: [] },
    achievements: { awards: [], volunteering: [] },
  } as unknown as ApiPortfolio

  it('reports only the counts that are not zero', () => {
    const stats = deriveStats(portfolio, 'en')
    const keys = stats.map((stat) => stat.key)

    expect(keys).toContain('projects')
    expect(keys).toContain('certifications')
    expect(keys).not.toContain('awards')
  })

  it('anchors each stat at the section it summarises', () => {
    const stats = deriveStats(portfolio, 'en')

    expect(stats.find((stat) => stat.key === 'projects')?.anchor).toBe('#projects')
  })

  it('reports nothing at all for an empty portfolio', () => {
    const empty = {
      experiences: [],
      projects: [],
      education: { certifications: [], degrees: [] },
      achievements: { awards: [], volunteering: [] },
    } as unknown as ApiPortfolio

    expect(deriveStats(empty, 'en')).toEqual([])
  })
})
