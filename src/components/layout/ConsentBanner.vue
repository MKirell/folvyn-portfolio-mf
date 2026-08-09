<template>
  <Transition
    enter-active-class="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
    enter-from-class="opacity-0 translate-y-3"
    leave-active-class="transition-[opacity,transform] duration-200 ease-in motion-reduce:transition-none"
    leave-to-class="opacity-0 translate-y-2"
  >
    <aside
      v-if="consent.needsBanner.value"
      class="fixed inset-x-0 bottom-0 z-[90] border-t border-line/12 bg-surface/95 backdrop-blur-[10px]"
      role="region"
      aria-labelledby="consent-title"
    >
      <div
        class="mx-auto flex w-full max-w-container items-center gap-5 px-pad py-4 max-900:flex-col max-900:items-start max-900:gap-3"
      >
        <div class="min-w-0 flex-1">
          <h2 id="consent-title" class="text-[0.9rem] font-semibold text-ink">
            {{ t.consent.title }}
          </h2>
          <p class="mt-1 text-[0.82rem] leading-[1.55] text-ink-soft">
            {{ t.consent.body }}
            <span class="text-muted">{{ t.consent.note }}</span>
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2 max-900:w-full">
          <button
            type="button"
            class="whitespace-nowrap rounded-[9px] border border-line/12 px-4 py-[9px] text-[0.82rem] text-ink-soft transition-colors motion-reduce:transition-none hover:border-line/25 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-900:flex-1"
            @click="consent.refuse()"
          >
            {{ t.consent.refuse }}
          </button>

          <button
            type="button"
            class="whitespace-nowrap rounded-[9px] bg-accent px-4 py-[9px] text-[0.82rem] font-medium text-bg transition-colors motion-reduce:transition-none hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-900:flex-1"
            @click="consent.accept()"
          >
            {{ t.consent.accept }}
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useConsent } from '@/composables/useConsent'
import { useMessages } from '@/i18n'

const consent = useConsent()
const t = useMessages()
</script>
