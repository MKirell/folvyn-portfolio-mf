<template>
  <div v-if="pageCount > 1" class="flex items-center gap-[10px]">
    <button
      type="button"
      class="flex items-center justify-center w-[26px] h-[26px] rounded-full border border-line/7 bg-surface text-ink-soft cursor-pointer transition-[border-color,color,opacity] motion-reduce:transition-none enabled:hover:border-accent/[0.38] enabled:hover:text-accent-deep disabled:opacity-35 disabled:cursor-default animate-icon-hint"
      :disabled="page === 0"
      :aria-label="`Previous ${label}`"
      @click="emit('previous')"
    >
      <ChevronLeft :size="16" />
    </button>
    <span class="flex items-center gap-[6px]">
      <button
        v-for="p in pageCount"
        :key="p"
        type="button"
        class="w-[6px] h-[6px] p-0 border-0 rounded-full bg-line/7 cursor-pointer transition-[background-color,transform] motion-reduce:transition-none hover:bg-accent/[0.38]"
        :class="{ '!bg-accent-deep scale-[1.3]': page === p - 1 }"
        :aria-label="`Go to ${label} page ${p}`"
        :aria-current="page === p - 1 ? 'true' : undefined"
        @click="emit('go', p - 1)"
      ></button>
    </span>
    <button
      type="button"
      class="flex items-center justify-center w-[26px] h-[26px] rounded-full border border-line/7 bg-surface text-ink-soft cursor-pointer transition-[border-color,color,opacity] motion-reduce:transition-none enabled:hover:border-accent/[0.38] enabled:hover:text-accent-deep disabled:opacity-35 disabled:cursor-default animate-icon-hint"
      :disabled="page === pageCount - 1"
      :aria-label="`Next ${label}`"
      @click="emit('next')"
    >
      <ChevronRight :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'

defineProps<{ page: number; pageCount: number; label: string }>()
const emit = defineEmits<{ previous: []; next: []; go: [number] }>()
</script>
