import { messagesFor } from '../i18n/messages'

export function honorsLabel(value: string | null, lang: string): string {
  if (!value) return ''
  return messagesFor(lang).vocabularies.honors[value] ?? value
}

export function levelLabel(value: string | null, lang: string): string {
  if (!value) return ''
  return messagesFor(lang).vocabularies.levels[value] ?? value.toUpperCase()
}
