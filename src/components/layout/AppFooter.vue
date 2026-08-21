<template>
  <footer class="bg-bg-tint border-t border-line/7 py-[30px]" :aria-label="a11y.siteFooter">
    <div class="w-full max-w-container mx-auto px-pad">
      <div
        class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-700:grid-cols-1 max-700:justify-items-center max-700:gap-[10px] max-700:text-center"
      >
        <a
          href="#main-content"
          class="flex shrink-0 items-center justify-self-start max-700:justify-self-center"
          :aria-label="a11y.goToTop"
        >
          <img :src="logoUrl" :alt="BRAND" class="h-[26px] max-700:h-[22px] w-auto block" />
        </a>

        <a
          v-if="CONSOLE_URL"
          :href="CONSOLE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 justify-self-center text-ink-soft text-[0.75rem] font-mono transition-colors motion-reduce:transition-none hover:text-accent-deep"
          :aria-label="fill(a11y.buildYours, { brand: BRAND })"
        >
          {{ footerCopy }}
          <ArrowUpRight
            :size="13"
            :stroke-width="2"
            class="shrink-0 text-gold animate-icon-hint"
            aria-hidden="true"
          />
        </a>
        <small v-else class="text-ink-soft text-[0.75rem] font-mono justify-self-center">{{
          footerCopy
        }}</small>
        <nav
          class="flex items-center gap-2 justify-self-end max-700:justify-self-center"
          :aria-label="a11y.footerLinks"
        >
          <a
            :href="legalUrl('privacy')"
            target="_blank"
            rel="noopener noreferrer"
            class="text-ink-soft text-[0.82rem] transition-colors motion-reduce:transition-none hover:text-accent-deep"
            >{{ t.labels.privacy }}</a
          >
          <span class="text-ink-soft/50 text-[0.82rem]" aria-hidden="true">·</span>
          <a
            :href="legalUrl('terms')"
            target="_blank"
            rel="noopener noreferrer"
            class="text-ink-soft text-[0.82rem] transition-colors motion-reduce:transition-none hover:text-accent-deep"
            >{{ t.labels.terms }}</a
          >
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import { BRAND } from '@/config/app'
import { brandLogo } from '@/utils/logo'
import { fill, useActiveLang, useMessages, useA11y } from '@/i18n'

const a11y = useA11y()
const CONSOLE_URL = (import.meta.env.VITE_CONSOLE_URL ?? '').replace(/\/+$/, '')

const t = useMessages()
const activeLang = useActiveLang()

function legalUrl(slug: 'privacy' | 'terms'): string {
  const lang = activeLang.value
  return lang ? `${CONSOLE_URL}/legal/${slug}?lang=${lang}` : `${CONSOLE_URL}/legal/${slug}`
}

const footerCopy = computed(() => fill(t.value.footer, { brand: BRAND }))

const { theme } = useTheme()
const logoUrl = computed(() => brandLogo(theme.value === 'light'))
</script>
