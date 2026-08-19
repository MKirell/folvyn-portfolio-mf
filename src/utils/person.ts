import { CALLING_CODES } from './dial-codes'
import { fill } from '../i18n/messages'
import type { Messages } from '../i18n/types'
import type { ApiPerson } from '../types/api'

export function fullName(person: Pick<ApiPerson, 'givenName' | 'familyName'>): string {
  return `${person.givenName} ${person.familyName}`.trim()
}

export function displayPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (!digits.startsWith('+')) return phone

  const prefix = CALLING_CODES.find(
    (code) => digits.startsWith(code) && digits.length > code.length,
  )
  if (!prefix) return phone

  const rest = digits.slice(prefix.length)
  const head = rest.length % 2 === 1 ? rest.slice(0, 1) : ''
  const pairs = rest.slice(head.length).match(/\d{2}/g) ?? []

  return [prefix, head, ...pairs].filter(Boolean).join(' ')
}

export function linkedinHandle(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+|\/+$/g, '')
  } catch {
    return url
  }
}

export function languageName(code: string | null, lang: string): string {
  if (!code) return ''
  try {
    const name = new Intl.DisplayNames([lang], { type: 'language' }).of(code) ?? code
    return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1)
  } catch {
    return code
  }
}

export function countryName(code: string | null, lang: string): string {
  if (!code) return ''
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

export function mapsUrl(locality: string, countryCode: string | null, lang = 'en'): string {
  const query = [locality, countryName(countryCode, lang)].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function contactBlurb(
  person: Pick<ApiPerson, 'headline' | 'affiliation'>,
  messages: Messages,
): string {
  const role = person.headline?.trim()
  const org = person.affiliation?.trim()

  if (role && org) {
    return fill(messages.labels.contactBlurbWorking, { role, org })
  }
  if (role) {
    return fill(messages.labels.contactBlurbRole, { role })
  }
  return messages.labels.contactBlurbPlain
}
