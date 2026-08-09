import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import type { ApiLocale } from '@/types/api'
import { track } from '@/composables/useAnalytics'

type Lang = string

const SESSION_KEY = 'portfolio_lang'
const LANG_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/

function looksLikeLang(value: string | null): value is Lang {
  return value !== null && LANG_PATTERN.test(value)
}

function getQueryLang(): Lang | null {
  const value = new URLSearchParams(location.search).get('lang')
  return looksLikeLang(value) ? value : null
}

function getStoredLang(): Lang | null {
  try {
    const value = localStorage.getItem(SESSION_KEY)
    return looksLikeLang(value) ? value : null
  } catch {
    return null
  }
}

function getBrowserLang(): Lang | null {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language || '']
  for (const pref of prefs) {
    const short = pref.toLowerCase().split('-')[0]
    if (looksLikeLang(short)) return short
  }
  return null
}

const preferred = getQueryLang() ?? getStoredLang() ?? getBrowserLang()
const lang = ref<Lang>(preferred ?? '')

watch(lang, (value) => {
  if (!value) return
  try {
    localStorage.setItem(SESSION_KEY, value)
  } catch {
    void 0
  }
  document.documentElement.lang = value
})

function setLang(newLang: Lang): Promise<void> {
  if (!looksLikeLang(newLang) || newLang === lang.value) return Promise.resolve()

  const url = new URL(location.href)
  url.searchParams.set('lang', newLang)
  history.pushState({ lang: newLang }, '', url.pathname + url.search)

  return usePortfolioStore()
    .load(newLang)
    .then(() => {
      lang.value = newLang
      track('lang', { target: newLang })
    })
}

window.addEventListener('popstate', () => {
  const value = getQueryLang()
  if (value) void setLang(value)
})

export interface UseLanguage {
  lang: Ref<Lang>
  setLang: (newLang: Lang) => Promise<void>
  availableLangs: ComputedRef<ApiLocale[]>
}

export function useLanguage(): UseLanguage {
  const store = usePortfolioStore()

  return {
    lang,
    setLang,
    availableLangs: computed(() => store.availableLangs),
  }
}

export { lang as currentLang, preferred as preferredLang }
