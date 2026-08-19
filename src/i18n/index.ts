import { createI18n } from 'vue-i18n'
import { computed, watch, type ComputedRef } from 'vue'
import { currentLang } from '@/composables/useLanguage'
import { usePortfolioStore } from '@/stores/portfolio'
import { DEFAULT_LANG, messages, messagesFor, uiLangFor } from '@/i18n/messages'
import type { Messages } from '@/i18n/types'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: DEFAULT_LANG,
  fallbackLocale: DEFAULT_LANG,
  missingWarn: false,
  fallbackWarn: false,
  messages,
})

export function setUiLang(lang: string): void {
  i18n.global.locale.value = uiLangFor(lang)
}

export function useActiveLang(): ComputedRef<string> {
  const store = usePortfolioStore()
  return computed(() => store.lang || currentLang.value)
}

export function useMessages(): ComputedRef<Messages> {
  const lang = useActiveLang()
  return computed(() => messagesFor(lang.value))
}

export function useA11y(): ComputedRef<Record<string, string>> {
  const messages = useMessages()
  return computed(() => messages.value.a11y)
}

export function syncUiLang(): void {
  const lang = useActiveLang()

  watch(
    lang,
    (value) => {
      if (value) setUiLang(value)
    },
    { immediate: true },
  )
}

export { DEFAULT_LANG, UI_LANGS, fill, messages, messagesFor, uiLangFor } from '@/i18n/messages'
export type { Messages, SectionKey, ShellHelpItem, StatKey } from '@/i18n/types'
