import { computed, type ComputedRef } from 'vue'
import { currentLang } from '@/composables/useLanguage'
import { usePortfolioStore } from '@/stores/portfolio'
import { messagesFor } from '@/i18n/messages'
import type { Messages } from '@/i18n/types'

export function useActiveLang(): ComputedRef<string> {
  const store = usePortfolioStore()
  return computed(() => store.lang || currentLang.value)
}

export function useMessages(): ComputedRef<Messages> {
  const lang = useActiveLang()
  return computed(() => messagesFor(lang.value))
}

export { DEFAULT_LANG, fill, messages, messagesFor } from '@/i18n/messages'
export type { Messages, SectionKey, ShellHelpItem, StatKey } from '@/i18n/types'
