import { CALLING_CODES } from './dial-codes'
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
