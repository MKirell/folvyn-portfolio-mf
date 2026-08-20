import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { fetchPortfolio } from '@/services/portfolio.api'
import { currentSlug } from '@/utils/slug'
import { useA11y } from '@/i18n'
import { setAssetPrefix } from '@/utils/docs'
import { deriveStats } from '@/utils/stats'
import { renderedSections, type SectionKey } from '@/utils/sections'
import type { ApiPortfolio } from '@/types/api'

export const usePortfolioStore = defineStore('portfolio', () => {
  const cache = new Map<string, ApiPortfolio>()
  const slug = ref<string | null>(currentSlug())
  const data = shallowRef<ApiPortfolio | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const inFlight = new Map<string, Promise<void>>()

  function load(lang?: string): Promise<void> {
    if (!slug.value) return Promise.resolve()

    const key = lang ?? ''
    const cached = cache.get(key)
    if (cached) {
      data.value = cached
      return Promise.resolve()
    }

    const pending = inFlight.get(key)
    if (pending) return pending

    const request = fetchInto(key, lang).finally(() => inFlight.delete(key))
    inFlight.set(key, request)
    return request
  }

  async function fetchInto(key: string, lang?: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      let loaded: ApiPortfolio
      try {
        loaded = await fetchPortfolio(slug.value as string, lang || undefined)
      } catch (first) {
        if (!lang || (first as { status?: number }).status !== 404) throw first
        loaded = await fetchPortfolio(slug.value as string)
      }
      setAssetPrefix(loaded.assetPrefix ?? '')
      cache.set(key, loaded)
      cache.set(loaded.lang, loaded)
      data.value = loaded
    } catch (e) {
      const status = (e as { status?: number }).status
      const a11y = useA11y().value
      error.value =
        status === 404
          ? a11y.notPublished
          : status
            ? a11y.unreachable
            : e instanceof Error
              ? e.message
              : a11y.unreachable
    } finally {
      loading.value = false
    }
  }

  function required(): ApiPortfolio {
    if (!data.value) throw new Error('Portfolio accessed before it finished loading')
    return data.value
  }

  return {
    data,
    loading,
    error,
    load,
    slug,
    hasSlug: computed(() => slug.value !== null),
    ready: computed(() => data.value !== null),
    lang: computed(() => data.value?.lang ?? ''),
    availableLangs: computed(() => data.value?.availableLangs ?? []),
    person: computed(() => required().person),
    profile: computed(() => required().profile),
    stats: computed(() => (data.value ? deriveStats(data.value, data.value.lang) : [])),
    experiences: computed(() => required().experiences),
    projects: computed(() => required().projects),
    skillCategories: computed(() => required().skillCategories),
    education: computed(() => required().education),
    achievements: computed(() => required().achievements),
    sections: computed(() => renderedSections(data.value)),
    shows: computed(() => {
      const keys = new Set(renderedSections(data.value).map((entry) => entry.key))
      return (key: SectionKey) => keys.has(key)
    }),
    tinted: computed(() => {
      const map = new Map(renderedSections(data.value).map((entry) => [entry.key, entry.tinted]))
      return (key: SectionKey) => map.get(key) === true
    }),
  }
})
