<template>
  <footer class="bg-bg-tint border-t border-line/7 py-[30px]" aria-label="Site footer">
    <div class="w-full max-w-container mx-auto px-pad">
      <div
        class="flex items-center justify-between gap-4 flex-wrap max-700:flex-col max-700:text-center max-700:gap-[10px]"
      >
        <img :src="logoUrl" :alt="BRAND" class="h-[26px] max-700:h-[22px] w-auto block" />

        <small class="text-ink-soft text-[0.75rem] font-mono">{{ footerCopy }}</small>
        <nav class="flex gap-5" aria-label="Footer links">
          <a
            :href="`${CONSOLE_URL}/legal/privacy`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-ink-soft text-[0.82rem] transition-colors motion-reduce:transition-none hover:text-accent-deep"
            >{{ t.labels.privacy }}</a
          >
          <a
            :href="`${CONSOLE_URL}/legal/terms`"
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
import { useTheme } from '@/composables/useTheme'
import { BRAND } from '@/brand'
import { brandLogo } from '@/utils/logo'
import { fill, useMessages } from '@/i18n'

const CONSOLE_URL = (import.meta.env.VITE_CONSOLE_URL ?? '').replace(/\/+$/, '')

const t = useMessages()

const footerCopy = computed(() =>
  fill(t.value.footer, { year: new Date().getFullYear(), brand: BRAND }),
)

const { theme } = useTheme()
const logoUrl = computed(() => brandLogo(theme.value === 'light'))
</script>
