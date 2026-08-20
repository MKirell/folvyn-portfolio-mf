<template>
  <section
    id="skills"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="skills-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'skills'" class="mb-12 max-1200:mb-10 max-700:mb-8">
        <div class="flex items-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <Wrench :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.skills
          }}</span>
        </div>
        <h2
          id="skills-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.skills }}
        </h2>
      </header>

      <div v-if="paged.hasPages.value" class="flex min-h-[26px] justify-end mb-5">
        <PageControl
          :page="paged.page.value"
          :page-count="paged.pageCount.value"
          label="skill categories"
          @previous="paged.previous"
          @next="paged.next"
          @go="paged.go"
        />
      </div>
      <ul
        :key="paged.page.value"
        aria-live="polite"
        class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-700:grid-cols-1 gap-5"
        :aria-label="a11y.skillCategories"
      >
        <li
          v-for="cat in paged.items.value"
          :key="cat.title"
          v-reveal
          class="bg-surface border border-line/7 rounded p-[22px] transition-[border-color,transform] motion-reduce:transition-none hover:border-accent/[0.38] hover:-translate-y-[3px]"
        >
          <div
            class="w-[38px] h-[38px] flex items-center justify-center text-accent-deep rounded-[10px] bg-accent/[0.14] mb-4"
            aria-hidden="true"
          >
            <component :is="icons[cat.icon]" :size="19" :stroke-width="1.8" />
          </div>
          <h3 class="font-disp text-base font-semibold text-ink mb-4">{{ cat.title }}</h3>
          <ul class="flex flex-wrap gap-[7px]" :aria-label="a11y.technologies">
            <li
              v-for="tag in cat.tags"
              :key="tag"
              class="inline-flex items-center bg-surface-2 border border-line/7 rounded-sm px-[10px] py-1 text-[0.78rem] text-ink-soft font-mono transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep"
              :class="{
                '!bg-accent/[0.14] !border-accent/[0.38] !text-accent-deep':
                  cat.accentTags?.includes(tag),
              }"
            >
              {{ tag }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useMessages, useA11y } from '@/i18n'
import type { Component } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { usePagedList } from '@/composables/usePagedList'
import PageControl from '@/components/items/PageControl.vue'
import { PAGE_SIZE } from '@/config/app'
import { Brain, Bot, Activity, Database, Globe, Cloud, Code2, Languages, Wrench } from '@lucide/vue'

const a11y = useA11y()
const store = usePortfolioStore()
const t = useMessages()
const { skillCategories } = storeToRefs(store)

const { lang } = useLanguage()
const paged = usePagedList(skillCategories, PAGE_SIZE.skillCategories, lang)

const icons: Record<string, Component> = {
  Brain,
  Bot,
  Activity,
  Database,
  Globe,
  Cloud,
  Code2,
  Languages,
}
</script>
