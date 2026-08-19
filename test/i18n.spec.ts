import { describe, expect, it } from 'vitest'
import { DEFAULT_LANG, UI_LANGS, messages, messagesFor, uiLangFor } from '@/i18n/messages'

describe('ui languages', () => {
  it('ships the interface languages it has been translated into', () => {
    expect(UI_LANGS).toEqual(['en', 'fr'])
  })

  it('serves the interface in a language it knows', () => {
    expect(uiLangFor('fr')).toBe('fr')
    expect(messagesFor('fr').nav.about).toBe('À propos')
    expect(messagesFor('fr').nav.contact).toBe('Contact')
  })

  it('falls back to English for a content locale it has no interface for', () => {
    expect(uiLangFor('zh')).toBe(DEFAULT_LANG)
    expect(messagesFor('zh')).toBe(messages.en)
    expect(messagesFor('ar').nav.about).toBe('About')
  })

  it('matches a regional content locale to its base interface language', () => {
    expect(uiLangFor('fr-CA')).toBe('fr')
    expect(uiLangFor('en-GB')).toBe('en')
  })

  it('falls back to English for a language not yet translated', () => {
    expect(uiLangFor('de')).toBe(DEFAULT_LANG)
    expect(uiLangFor('es')).toBe(DEFAULT_LANG)
    expect(uiLangFor('pt')).toBe(DEFAULT_LANG)
  })

  it('gives every language the same keys as English', () => {
    const paths = (value: unknown, prefix = ''): string[] => {
      if (Array.isArray(value)) return [prefix]
      if (value && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
          paths(nested, prefix ? `${prefix}.${key}` : key),
        )
      }
      return [prefix]
    }

    const english = paths(messages.en).sort()
    for (const code of UI_LANGS) {
      expect({ code, keys: paths(messages[code]).sort() }).toEqual({ code, keys: english })
    }
  })
})
