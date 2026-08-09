<template>
  <section
    id="experience"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="experience-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'experience'" class="mb-12 max-1200:mb-10 max-700:mb-8">
        <div class="flex items-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <Briefcase :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.experience
          }}</span>
        </div>
        <h2
          id="experience-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.experience }}
        </h2>
      </header>
      <ol
        class="relative before:content-[''] before:absolute before:start-[19px] before:top-2 before:bottom-2 before:w-px before:bg-line/12 max-700:before:hidden"
      >
        <template v-for="row in rows" :key="row.kind + row.index">
          <li
            v-if="row.kind === 'job' && row.job"
            :key="`job-${row.index}`"
            v-reveal
            class="last:mb-0 relative"
            :class="
              isOpen(row.index)
                ? 'flex gap-8 max-700:gap-4 mb-12 max-700:mb-8'
                : 'flex items-center gap-8 max-700:gap-4 mb-2 max-700:mb-1.5'
            "
          >
            <div
              v-if="row.index === 0"
              class="shrink-0 w-10 h-10 max-700:hidden rounded-full bg-surface border-2 border-accent shadow-[0_0_0_6px_theme(colors.bg)] z-[1]"
              aria-hidden="true"
            ></div>
            <button
              v-else
              type="button"
              class="shrink-0 w-10 h-10 max-700:hidden rounded-full bg-surface border-2 border-accent shadow-[0_0_0_6px_theme(colors.bg)] z-[1] flex items-center justify-center p-0 text-accent cursor-pointer transition-[transform,background-color] motion-reduce:transition-none hover:bg-accent/[0.14] hover:scale-[1.08]"
              :aria-label="isOpen(row.index) ? t.labels.showLess : t.labels.showMore"
              @click="toggleJob(row.index)"
            >
              <component
                :is="isOpen(row.index) ? Minus : Plus"
                :size="16"
                class="animate-icon-hint"
              />
            </button>
            <article
              v-if="isOpen(row.index)"
              class="flex-1 bg-surface border border-line/7 rounded-lg py-[30px] px-[34px] max-700:p-[22px] transition-colors motion-reduce:transition-none hover:border-accent/[0.38]"
            >
              <header class="flex flex-wrap items-center justify-between gap-2 mb-[10px]">
                <span
                  class="font-mono text-[0.78rem] font-medium text-accent-deep tracking-[0.06em] uppercase inline-flex items-center gap-2"
                >
                  {{ row.job.company }}
                  <a
                    v-if="row.job.link"
                    :href="row.job.link || undefined"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-gold -mt-px opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 shrink-0 animate-icon-hint"
                    title="View on LinkedIn"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      width="15"
                      height="15"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </span>
                <div class="flex items-center gap-2">
                  <time class="text-ink-soft text-[0.75rem]">{{ period(row.job) }}</time>
                  <a
                    v-if="row.job.doc"
                    :href="docUrl(row.job.doc)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-gold opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 leading-none animate-icon-hint"
                    title="View attestation"
                  >
                    <Paperclip :size="15" />
                  </a>
                </div>
              </header>
              <p
                class="font-disp text-[1.2rem] font-semibold text-ink mb-4 flex items-center gap-[10px] flex-wrap"
              >
                {{ row.job.role }}
                <span
                  v-if="row.job.current"
                  class="font-mono text-[0.64rem] font-medium bg-sage/[0.12] border border-[rgba(110,127,92,0.3)] text-sage rounded-full px-[11px] py-[3px] tracking-[0.05em] uppercase"
                  >{{ t.labels.currentRole }}</span
                >
              </p>
              <ul class="ps-0 mb-[18px] flex flex-col gap-[10px]">
                <li
                  v-for="(bullet, bi) in row.job.bullets"
                  :key="bi"
                  class="text-ink-soft text-[0.95rem] leading-[1.75] ps-[18px] relative before:content-['—'] before:absolute before:start-0 before:text-accent"
                  v-html="boldify(bullet)"
                ></li>
              </ul>
              <ul class="flex flex-wrap gap-[7px]" aria-label="Technologies used">
                <li
                  v-for="tag in row.job.tags"
                  :key="tag"
                  class="inline-flex items-center bg-surface-2 border border-line/7 rounded-sm px-[9px] py-[3px] text-[0.72rem] text-ink-soft font-mono transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep"
                >
                  {{ tag }}
                </li>
              </ul>
              <button
                v-if="row.index !== 0"
                type="button"
                aria-expanded="true"
                :aria-label="t.labels.showLess"
                class="hidden max-700:flex w-full items-center justify-center mt-[18px] pt-3 border-0 border-t border-line/7 bg-transparent cursor-pointer text-accent opacity-70 transition-opacity motion-reduce:transition-none hover:opacity-100"
                @click="toggleJob(row.index)"
              >
                <ChevronUp :size="16" :stroke-width="2" class="animate-icon-hint" />
              </button>
            </article>
            <button
              v-else
              type="button"
              aria-expanded="false"
              :aria-label="`${row.job.company} — ${row.job.role}, ${t.labels.showMore}`"
              class="min-w-0 flex-1 grid grid-cols-[auto_1fr_auto] max-700:grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 bg-surface border border-line/7 rounded-md px-4 py-[9px] max-700:px-3 max-700:py-2 text-left cursor-pointer transition-colors motion-reduce:transition-none hover:border-accent/[0.28]"
              @click="toggleJob(row.index)"
            >
              <span class="min-w-0 truncate text-[0.78rem] font-medium text-ink">{{
                row.job.company
              }}</span>
              <span
                class="min-w-0 truncate text-[0.78rem] max-700:text-[0.73rem] text-ink-soft opacity-70 max-700:col-start-1 max-700:col-span-2 max-700:row-start-2 max-700:pe-5"
                ><span aria-hidden="true" class="me-2 max-700:hidden">·</span
                >{{ row.job.role }}</span
              >
              <time
                class="shrink-0 font-mono text-[0.68rem] max-700:text-[0.63rem] text-ink-soft opacity-70 max-700:col-start-2 max-700:row-start-1"
              >
                <span
                  v-for="(seg, si) in periodSegments(period(row.job))"
                  :key="si"
                  :class="seg.duration ? 'max-700:hidden' : undefined"
                  ><span v-if="si > 0" aria-hidden="true"> · </span>{{ seg.text }}</span
                >
              </time>
              <ChevronDown
                :size="15"
                :stroke-width="2"
                class="hidden max-700:block max-700:col-start-2 max-700:row-start-2 justify-self-end self-center shrink-0 text-accent opacity-70 animate-icon-hint"
                aria-hidden="true"
              />
            </button>
          </li>
          <li
            v-else-if="row.kind === 'fold'"
            :key="'fold'"
            v-reveal
            class="relative flex items-center gap-8 max-700:gap-4 mb-2 max-700:mb-1.5"
          >
            <button
              type="button"
              class="shrink-0 w-10 h-10 max-700:hidden rounded-full bg-surface border-2 border-line/12 shadow-[0_0_0_6px_theme(colors.bg)] z-[1] flex items-center justify-center p-0 text-ink-soft cursor-pointer transition-[border-color,color] motion-reduce:transition-none hover:border-line/25 hover:text-ink"
              :aria-label="`${foldSummary.count} ${t.labels.earlierRoles}, ${t.labels.showMore}`"
              @click="foldOpen = true"
            >
              <Layers :size="15" :stroke-width="2" />
            </button>
            <button
              type="button"
              aria-expanded="false"
              :aria-label="`${foldSummary.count} ${t.labels.earlierRoles}, ${t.labels.showMore}`"
              class="min-w-0 flex-1 grid grid-cols-[auto_1fr_auto] max-700:grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 bg-surface border border-line/7 border-dashed rounded-md px-4 py-[9px] max-700:px-3 max-700:py-2 text-left cursor-pointer transition-colors motion-reduce:transition-none hover:border-accent/[0.28]"
              @click="foldOpen = true"
            >
              <span class="min-w-0 truncate text-[0.78rem] font-medium text-ink"
                >{{ foldSummary.count }} {{ t.labels.earlierRoles }}</span
              >
              <span
                class="min-w-0 truncate text-[0.78rem] max-700:text-[0.73rem] text-ink-soft opacity-70 max-700:col-start-1 max-700:col-span-2 max-700:row-start-2 max-700:pe-5"
                ><span aria-hidden="true" class="me-2 max-700:hidden">·</span
                >{{ foldSummary.companies }}</span
              >
              <time
                class="shrink-0 font-mono text-[0.68rem] max-700:text-[0.63rem] text-ink-soft opacity-70 max-700:col-start-2 max-700:row-start-1"
                >{{ foldSummary.span }}</time
              >
              <ChevronDown
                :size="15"
                :stroke-width="2"
                class="hidden max-700:block max-700:col-start-2 max-700:row-start-2 justify-self-end self-center shrink-0 text-accent opacity-70 animate-icon-hint"
                aria-hidden="true"
              />
            </button>
          </li>
          <li v-else :key="'collapse'" class="relative flex items-center gap-8 max-700:gap-4">
            <button
              type="button"
              class="shrink-0 w-10 h-10 max-700:hidden rounded-full bg-surface border-2 border-line/12 shadow-[0_0_0_6px_theme(colors.bg)] z-[1] flex items-center justify-center p-0 text-ink-soft cursor-pointer transition-[border-color,color] motion-reduce:transition-none hover:border-line/25 hover:text-ink"
              :aria-label="`${foldSummary.count} ${t.labels.earlierRoles}, ${t.labels.showLess}`"
              @click="foldOpen = false"
            >
              <Layers :size="15" :stroke-width="2" />
            </button>
            <button
              type="button"
              aria-expanded="true"
              class="flex items-center gap-1.5 bg-transparent border-0 p-0 text-[0.74rem] text-accent opacity-70 cursor-pointer transition-opacity motion-reduce:transition-none hover:opacity-100"
              @click="foldOpen = false"
            >
              <ChevronUp :size="14" :stroke-width="2" class="animate-icon-hint" />
              {{ t.labels.showLess }}
            </button>
          </li>
        </template>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { computed, ref } from 'vue'
import { boldify } from '@/utils/text'
import { docUrl } from '@/utils/docs'
import { Paperclip, Plus, Minus, Briefcase, ChevronDown, ChevronUp, Layers } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useActiveLang, useMessages } from '@/i18n'
import { formatPeriod } from '@/utils/period'
import { EXPERIENCE_VISIBLE } from '@/config/pagination'
import type { ApiExperience } from '@/types/api'

const store = usePortfolioStore()
const t = useMessages()
const activeLang = useActiveLang()
const { experiences } = storeToRefs(store)

const OPEN_BY_DEFAULT = 1
const DURATION_PART = /^\d+\s+\S+$/

const openJobs = ref(new Set(Array.from({ length: OPEN_BY_DEFAULT }, (_, i) => i)))
const foldOpen = ref(false)

type Row =
  | { kind: 'job'; job: ApiExperience; index: number }
  | { kind: 'fold' | 'collapse'; job?: undefined; index: number }

const folding = computed(() => experiences.value.length > EXPERIENCE_VISIBLE)
const head = computed(() =>
  folding.value ? experiences.value.slice(0, EXPERIENCE_VISIBLE - 1) : experiences.value,
)
const tail = computed(() => (folding.value ? experiences.value.slice(EXPERIENCE_VISIBLE - 1) : []))

const rows = computed<Row[]>(() => {
  const entries: Row[] = head.value.map((job, index) => ({ kind: 'job', job, index }))
  if (!folding.value) return entries

  if (!foldOpen.value) return [...entries, { kind: 'fold', index: entries.length }]

  const offset = EXPERIENCE_VISIBLE - 1
  return [
    ...entries,
    ...tail.value.map((job, i) => ({ kind: 'job' as const, job, index: offset + i })),
    { kind: 'collapse' as const, index: experiences.value.length },
  ]
})

const foldSummary = computed(() => {
  const roles = tail.value
  const years = roles
    .flatMap((job) => [job.startDate, job.endDate])
    .filter((value): value is string => Boolean(value))
    .map((value) => value.slice(0, 4))
    .sort()

  const first = years[0]
  const last = years[years.length - 1]
  const current = roles.some((job) => !job.endDate)

  return {
    count: roles.length,
    companies: roles.map((job) => job.company).join(', '),
    span: !first ? '' : current || first === last ? first : `${first} — ${last}`,
  }
})

function period(job: ApiExperience): string {
  return formatPeriod(job, activeLang.value)
}

function periodSegments(period: string): { text: string; duration: boolean }[] {
  return period
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text) => ({ text, duration: DURATION_PART.test(text) }))
}

function isOpen(i: number): boolean {
  return openJobs.value.has(i)
}
function toggleJob(i: number) {
  const next = new Set(openJobs.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  openJobs.value = next
}
</script>
