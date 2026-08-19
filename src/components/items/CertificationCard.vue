<template>
  <li
    class="flex items-center gap-4 max-600:flex-wrap max-600:gap-y-2 bg-surface border border-line/7 rounded px-[19px] py-[16px] transition-colors motion-reduce:transition-none hover:border-accent/[0.38]"
  >
    <div
      class="shrink-0 w-10 h-10 flex items-center justify-center text-accent-deep rounded-[10px] bg-accent/[0.14]"
      aria-hidden="true"
    >
      <component :is="icons[item.icon]" :size="19" :stroke-width="1.8" />
    </div>
    <div class="flex-1 max-600:min-w-0">
      <p class="text-[0.92rem] text-ink font-medium mb-[3px]">{{ item.title }}</p>
      <div class="flex items-center justify-between gap-2">
        <p class="text-ink-soft text-[0.72rem] font-mono">{{ item.issuer }}</p>
        <time
          v-if="item.date"
          class="hidden max-900:inline shrink-0 font-mono text-[0.68rem] text-ink-soft opacity-70 whitespace-nowrap"
          >{{ shownDate }}</time
        >
      </div>
    </div>
    <span class="max-600:ms-auto flex items-center gap-2 shrink-0">
      <time
        v-if="item.date"
        class="max-900:hidden font-mono text-[0.68rem] text-ink-soft opacity-70 whitespace-nowrap"
        >{{ shownDate }}</time
      >
      <a
        v-if="item.doc"
        :href="docUrl(item.doc)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center text-gold opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 leading-none animate-icon-hint"
        :title="a11y.viewCertificate"
      >
        <Paperclip :size="15" />
      </a>
    </span>
  </li>
</template>

<script setup lang="ts">
import { Paperclip } from '@lucide/vue'
import { computed } from 'vue'
import { docUrl } from '@/utils/docs'
import { formatMonthShort } from '@/utils/period'
import { useActiveLang } from '@/i18n'
import { icons } from '@/utils/icons'
import type { ApiCertification } from '@/types/api'
import { useA11y } from '@/i18n'

const props = defineProps<{ item: ApiCertification }>()
const a11y = useA11y()
const activeLang = useActiveLang()
const shownDate = computed(() => formatMonthShort(props.item.date, activeLang.value))
</script>
