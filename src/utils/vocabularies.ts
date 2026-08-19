import { messagesFor } from '../i18n/messages'

/**
 * A controlled vocabulary is stored as a stable code and read in the visitor's
 * language, so nobody translates "very-good" by hand the way they translate prose.
 */
export function honorsLabel(value: string | null, lang: string): string {
  if (!value) return ''
  return messagesFor(lang).vocabularies.honors[value] ?? value
}

export function levelLabel(value: string | null, lang: string): string {
  if (!value) return ''
  return messagesFor(lang).vocabularies.levels[value] ?? value.toUpperCase()
}
