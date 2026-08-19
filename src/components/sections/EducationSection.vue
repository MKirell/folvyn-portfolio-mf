<template>
  <section
    id="education"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="education-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'education'" class="mb-12 max-1200:mb-10 max-700:mb-8">
        <div class="flex items-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <GraduationCap :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.education
          }}</span>
        </div>
        <h2
          id="education-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.education }}
        </h2>
      </header>

      <div v-reveal class="grid grid-cols-2 max-900:grid-cols-1 gap-12">
        <div>
          <div class="flex min-h-[26px] items-center justify-between gap-3 mb-[26px]">
            <p
              class="font-mono font-medium text-accent-deep tracking-[0.1em] uppercase text-[0.78rem]"
            >
              {{ t.labels.degrees }}
            </p>
            <PageControl
              :page="degrees.page.value"
              :page-count="degrees.pageCount.value"
              label="degrees"
              @previous="degrees.previous"
              @next="degrees.next"
              @go="degrees.go"
            />
          </div>
          <ul
            :key="degrees.page.value"
            class="flex flex-col animate-fade-up motion-reduce:animate-none"
          >
            <li
              v-for="deg in degrees.items.value"
              :key="deg.title"
              class="flex gap-5 max-480:flex-col max-480:gap-[6px] py-5 border-b border-line/7 last:border-b-0"
            >
              <time
                :datetime="deg.startDate"
                class="max-480:w-auto max-480:border-e-0 max-480:pe-0 max-480:pt-0 w-[118px] shrink-0 whitespace-nowrap border-e border-line/8 pe-5 pt-[3px] font-mono text-[0.75rem] leading-[1.75] tracking-[0.02em] text-ink-soft"
                >{{ span(deg) }}</time
              >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-disp text-[1.05rem] font-semibold text-ink mb-[5px]">
                    {{ deg.title }}
                  </h3>
                  <a
                    v-if="deg.doc"
                    :href="docUrl(deg.doc)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-gold opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 leading-none shrink-0 -mt-[5px] animate-icon-hint"
                    :title="a11y.viewDiploma"
                  >
                    <Paperclip :size="15" />
                  </a>
                </div>
                <div>
                  <span v-if="deg.school" class="flex items-center gap-2">
                    <span class="block text-[0.85rem] leading-[1.75] text-ink font-medium">{{
                      deg.school
                    }}</span>
                    <a
                      v-if="deg.link"
                      :href="deg.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center justify-center text-gold opacity-70 shrink-0 transition-opacity motion-reduce:transition-none hover:opacity-100 animate-icon-hint"
                      :title="a11y.viewLinkedin"
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
                  <span
                    v-if="place(deg)"
                    class="block text-[0.85rem] leading-[1.75] text-ink-soft"
                    >{{ place(deg) }}</span
                  >
                  <span
                    v-if="deg.honors"
                    class="inline-block mt-[9px] bg-gold/[0.12] border border-[rgba(184,137,59,0.3)] rounded-[6px] px-[10px] py-[2px] text-[0.76rem] text-gold font-mono"
                    >{{ honorsLabel(deg.honors, lang) }} ✦</span
                  >
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div>
          <div class="flex min-h-[26px] items-center justify-between gap-3 mb-[26px]">
            <p
              class="font-mono font-medium text-accent-deep tracking-[0.1em] uppercase text-[0.78rem]"
            >
              {{ t.labels.certifications }}
            </p>
            <PageControl
              :page="certifications.page.value"
              :page-count="certifications.pageCount.value"
              label="certifications"
              @previous="certifications.previous"
              @next="certifications.next"
              @go="certifications.go"
            />
          </div>
          <ul
            :key="certifications.page.value"
            class="flex flex-col gap-[14px] animate-fade-up motion-reduce:animate-none"
          >
            <CertificationCard
              v-for="(cert, i) in certifications.items.value"
              :key="i"
              v-card="cert.id"
              :item="cert"
            />
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { usePagedList } from '@/composables/usePagedList'
import CertificationCard from '@/components/items/CertificationCard.vue'
import PageControl from '@/components/items/PageControl.vue'
import { docUrl } from '@/utils/docs'
import { formatPlace, formatYearSpan } from '@/utils/period'
import { honorsLabel } from '@/utils/vocabularies'
import type { ApiDegree } from '@/types/api'
import { Paperclip, GraduationCap } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useMessages, useA11y } from '@/i18n'
import { PAGE_SIZE } from '@/config/pagination'

const a11y = useA11y()
const store = usePortfolioStore()
const t = useMessages()
const { education } = storeToRefs(store)

const { lang } = useLanguage()

function span(degree: ApiDegree): string {
  return formatYearSpan(degree.startDate, degree.endDate, lang.value)
}

function place(degree: ApiDegree): string {
  return formatPlace(degree.country, degree.city, lang.value)
}

const degrees = usePagedList(
  computed(() => education.value.degrees),
  PAGE_SIZE.degrees,
  lang,
)
const certifications = usePagedList(
  computed(() => education.value.certifications),
  PAGE_SIZE.certifications,
  lang,
)
</script>
