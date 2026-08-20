import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AppNav from '@/components/layout/AppNav.vue'
import { vReveal } from '@/directives/reveal'
import { usePortfolioStore } from '@/stores/portfolio'
import { useLanguage } from '@/composables/useLanguage'
import { languageName } from '@/utils/person'
import * as api from '@/services/portfolio.api'
import { fixtures } from '../setup'
import type { ApiLocale } from '@/types/api'

const CATALOGUE: ApiLocale[] = [
  { code: 'en', flagCode: 'gb' },
  { code: 'fr', flagCode: 'fr' },
  { code: 'ar', flagCode: 'tn' },
  { code: 'es', flagCode: 'es' },
  { code: 'de', flagCode: 'de' },
]

function withLocales(count: number): ApiLocale[] {
  const langs = CATALOGUE.slice(0, count)

  vi.mocked(api.fetchPortfolio).mockImplementation((_slug: string, lang?: string) =>
    Promise.resolve({ ...fixtures.en, lang: lang ?? 'en', availableLangs: langs }),
  )

  usePortfolioStore().data = { ...fixtures.en, availableLangs: langs }
  return langs
}

function chip(html: string): string {
  return html.slice(html.indexOf('perspective-'))
}

describe('the language switcher holds for any number of locales', () => {
  beforeEach(() => {
    useLanguage().lang.value = 'en'
  })

  it.each([1, 2, 3, 4, 5])('shows exactly one chip with %i locales', async (count) => {
    withLocales(count)
    await nextTick()

    const wrapper = mount(AppNav, { global: { directives: { reveal: vReveal } } })
    const flags = chip(wrapper.html()).match(/background-image/g) ?? []

    expect(flags).toHaveLength(1)
  })

  it.each([2, 3, 4, 5])('shows the language actually in use, with %i locales', async (count) => {
    const langs = withLocales(count)
    await nextTick()

    for (const locale of langs) {
      useLanguage().lang.value = locale.code
      withLocales(count)
      await nextTick()

      const wrapper = mount(AppNav, { global: { directives: { reveal: vReveal } } })
      const visible = chip(wrapper.html())

      expect(visible).toContain(locale.code.toUpperCase())
      for (const other of langs.filter((entry) => entry.code !== locale.code)) {
        expect(visible).not.toContain(`>${other.code.toUpperCase()}`)
      }
    }
  })

  it.each([2, 3, 4, 5])('always points at the next locale, with %i of them', async (count) => {
    const langs = withLocales(count)
    await nextTick()

    for (const [index, locale] of langs.entries()) {
      useLanguage().lang.value = locale.code
      withLocales(count)
      await nextTick()

      const next = langs[(index + 1) % langs.length]
      const label = mount(AppNav, { global: { directives: { reveal: vReveal } } })
        .find('button[data-language-switch]')
        .attributes('aria-label')

      expect(label).toContain(languageName(locale.code, locale.code))
      expect(label).toContain(languageName(next.code, locale.code))
    }
  })

  it('survives a language that is no longer offered', async () => {
    withLocales(3)
    useLanguage().lang.value = 'ar'
    await nextTick()

    withLocales(2)
    await nextTick()

    const wrapper = mount(AppNav, { global: { directives: { reveal: vReveal } } })
    expect(chip(wrapper.html())).toContain('EN')
  })
})
