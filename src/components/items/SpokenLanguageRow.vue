<template>
  <li class="flex flex-col gap-3">
    <div class="flex items-center gap-[10px]">
      <span
        class="inline-block w-[22px] h-[16px] bg-cover bg-center bg-no-repeat rounded-[3px] shrink-0"
        :style="{ backgroundImage: `url(&quot;${flagUrl(item.flagCode)}&quot;)` }"
        aria-hidden="true"
      ></span>
      <span class="text-ink text-[0.92rem] font-medium">{{ item.name }}</span>
      <span class="text-ink-soft text-[0.72rem] ms-auto leading-none">{{ item.level }}</span>
      <a
        v-if="item.doc"
        :href="docUrl(item.doc)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center text-gold opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 leading-none shrink-0 animate-icon-hint"
        title="View certificate"
      >
        <Paperclip :size="15" />
      </a>
    </div>
    <div
      class="h-[6px] bg-line/7 rounded-[3px] overflow-hidden"
      role="progressbar"
      :aria-valuenow="item.pct"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="item.name + ' proficiency'"
    >
      <div
        class="h-full bg-gradient-to-r from-accent to-gold rounded-[3px] transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
        :style="{ width: item.pct + '%' }"
      ></div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { Paperclip } from '@lucide/vue'
import { docUrl } from '@/utils/docs'
import { flagUrl } from '@/utils/flags'
import type { ApiSpokenLanguage } from '@/types/api'

defineProps<{ item: ApiSpokenLanguage }>()
</script>
