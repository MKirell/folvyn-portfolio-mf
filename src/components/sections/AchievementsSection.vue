<template>
  <section
    id="achievements"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="achievements-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'achievements'" class="mb-12 max-1200:mb-10 max-700:mb-8">
        <div class="flex items-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <Sparkles :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.achievements
          }}</span>
        </div>
        <h2
          id="achievements-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.achievements }}
        </h2>
      </header>

      <div v-reveal class="grid grid-cols-2 max-900:grid-cols-1 gap-12">
        <div>
          <div class="flex min-h-[26px] items-center justify-between gap-3 mb-[22px]">
            <h3
              class="font-mono text-[0.78rem] font-medium text-accent-deep tracking-[0.1em] uppercase"
            >
              {{ t.labels.volunteering }}
            </h3>
            <PageControl
              :page="volunteering.page.value"
              :page-count="volunteering.pageCount.value"
              label="volunteering"
              @previous="volunteering.previous"
              @next="volunteering.next"
              @go="volunteering.go"
            />
          </div>
          <ul :key="volunteering.page.value" class="animate-fade-up motion-reduce:animate-none">
            <li
              v-for="vol in volunteering.items.value"
              :key="vol.org"
              class="border-s-2 border-accent ps-5 mb-7 last:mb-0"
            >
              <span class="flex items-center gap-2 mb-1">
                <p class="font-disp text-[1.05rem] font-semibold text-accent">{{ vol.org }}</p>
                <a
                  v-if="vol.link"
                  :href="vol.link || undefined"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center text-gold opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 shrink-0 animate-icon-hint"
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
              <p class="text-[0.92rem] text-ink font-medium mb-[5px]">{{ vol.role }}</p>
              <div class="flex items-center gap-2 mb-[10px]">
                <time class="font-mono text-[0.75rem] text-ink-soft opacity-75">{{
                  volPeriod(vol)
                }}</time>
                <a
                  v-if="vol.doc"
                  :href="docUrl(vol.doc)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center text-gold opacity-60 transition-opacity motion-reduce:transition-none hover:opacity-100 leading-none shrink-0 animate-icon-hint"
                  :title="a11y.viewAttestation"
                >
                  <Paperclip :size="15" />
                </a>
              </div>
              <p class="text-[0.92rem] text-ink-soft leading-[1.7]" v-html="boldify(vol.desc)"></p>
            </li>
          </ul>
        </div>
        <div>
          <div class="flex min-h-[26px] items-center justify-between gap-3 mb-[22px]">
            <h3
              class="font-mono text-[0.78rem] font-medium text-accent-deep tracking-[0.1em] uppercase"
            >
              {{ t.labels.awards }}
            </h3>
            <PageControl
              :page="awards.page.value"
              :page-count="awards.pageCount.value"
              label="awards"
              @previous="awards.previous"
              @next="awards.next"
              @go="awards.go"
            />
          </div>
          <ul
            :key="awards.page.value"
            class="flex flex-col gap-[14px] animate-fade-up motion-reduce:animate-none"
          >
            <li
              v-for="award in awards.items.value"
              :key="award.title"
              class="flex items-center gap-4 max-600:flex-wrap max-600:gap-y-2 bg-surface border border-line/7 rounded px-[19px] py-[16px] transition-colors motion-reduce:transition-none hover:border-gold/[0.38]"
            >
              <div
                class="shrink-0 w-10 h-10 flex items-center justify-center text-gold rounded-[10px] bg-gold/[0.14]"
                aria-hidden="true"
              >
                <component :is="icons[award.icon]" :size="19" :stroke-width="1.8" />
              </div>
              <div class="flex-1 max-600:min-w-0">
                <p class="text-[0.92rem] text-ink font-medium mb-[3px]">
                  {{ award.title }}
                </p>
                <div class="flex items-center justify-between gap-2">
                  <span
                    v-if="award.country"
                    class="flex items-center gap-[6px] font-mono text-[0.72rem] text-ink-soft"
                  >
                    {{ formatPlace(award.country, award.city, activeLang) }}
                    <span
                      class="block w-4 h-[11px] bg-cover bg-center bg-no-repeat rounded-[2px] shrink-0"
                      :style="{
                        backgroundImage: `url(&quot;${flagUrl(award.country.toLowerCase())}&quot;)`,
                      }"
                      aria-hidden="true"
                    ></span>
                  </span>
                  <time
                    v-if="award.date"
                    class="hidden max-900:inline shrink-0 font-mono text-[0.68rem] text-ink-soft opacity-70 whitespace-nowrap"
                    >{{ formatMonthShort(award.date, activeLang) }}</time
                  >
                </div>
              </div>
              <span class="max-600:ms-auto flex items-center gap-2 shrink-0">
                <time
                  v-if="award.date"
                  class="max-900:hidden font-mono text-[0.68rem] text-ink-soft opacity-70 whitespace-nowrap"
                  >{{ formatMonthShort(award.date, activeLang) }}</time
                >
                <button
                  type="button"
                  class="flex items-center justify-center bg-transparent border-0 p-0 shrink-0 transition-opacity motion-reduce:transition-none"
                  :class="
                    award.images && award.images.length
                      ? 'cursor-pointer text-gold opacity-70 hover:opacity-100 animate-icon-hint'
                      : 'cursor-default text-ink-soft opacity-30'
                  "
                  :tabindex="award.images && award.images.length ? 0 : -1"
                  :title="a11y.viewPhotos"
                  @click="
                    award.images && award.images.length && openLightbox(award.images, award.title)
                  "
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
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </button>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="lightbox.open"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-scrim/[0.88] p-10"
        @click.self="closeLightbox"
      >
        <button
          class="absolute top-5 right-6 flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-line/12 text-ink-soft leading-none cursor-pointer opacity-90 transition-[opacity,border-color,color] motion-reduce:transition-none hover:opacity-100 hover:border-accent/[0.38] hover:text-accent-deep"
          type="button"
          :aria-label="a11y.close"
          @click="closeLightbox"
        >
          <X :size="22" />
        </button>
        <button
          v-if="lightbox.images.length > 1"
          class="absolute top-1/2 -translate-y-1/2 left-14 max-700:left-6 bg-surface border border-line/12 text-ink-soft leading-none w-11 h-11 rounded-full cursor-pointer flex items-center justify-center opacity-90 transition-[opacity,border-color,color] motion-reduce:transition-none hover:opacity-100 hover:border-accent/[0.38] hover:text-accent-deep"
          type="button"
          :aria-label="a11y.previousImage"
          @click="prevImage"
        >
          <ChevronLeft :size="26" />
        </button>
        <img
          class="max-w-[min(90vw,900px)] max-h-[85vh] rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          :src="imgUrl(lightbox.images[lightbox.index])"
          :alt="`${lightbox.title} — photo ${lightbox.index + 1} of ${lightbox.images.length}`"
        />
        <button
          v-if="lightbox.images.length > 1"
          class="absolute top-1/2 -translate-y-1/2 right-14 max-700:right-6 bg-surface border border-line/12 text-ink-soft leading-none w-11 h-11 rounded-full cursor-pointer flex items-center justify-center opacity-90 transition-[opacity,border-color,color] motion-reduce:transition-none hover:opacity-100 hover:border-accent/[0.38] hover:text-accent-deep"
          type="button"
          :aria-label="a11y.nextImage"
          @click="nextImage"
        >
          <ChevronRight :size="26" />
        </button>
        <span
          v-if="lightbox.images.length > 1"
          class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-surface border border-line/12 px-3 py-1 text-ink-soft font-mono text-[0.78rem]"
          >{{ lightbox.index + 1 }} / {{ lightbox.images.length }}</span
        >
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { computed, ref, onUnmounted, type Component } from 'vue'
import { boldify } from '@/utils/text'
import { docUrl, imgUrl } from '@/utils/docs'
import { flagUrl } from '@/utils/flags'
import { formatMonthShort } from '@/utils/period'
import {
  Paperclip,
  X,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Medal,
  Award,
  Sparkles,
} from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useMessages, useA11y, useActiveLang } from '@/i18n'
import { useLanguage } from '@/composables/useLanguage'
import { formatPlace, formatSpanWithDuration } from '@/utils/period'
import type { ApiVolunteering } from '@/types/api'
import { usePagedList } from '@/composables/usePagedList'
import PageControl from '@/components/items/PageControl.vue'
import { PAGE_SIZE } from '@/config/app'

const a11y = useA11y()
const activeLang = useActiveLang()
const store = usePortfolioStore()
const t = useMessages()
const { achievements } = storeToRefs(store)

const { lang } = useLanguage()

function volPeriod(vol: ApiVolunteering): string {
  return formatSpanWithDuration(vol.startDate, vol.endDate, lang.value)
}

const volunteering = usePagedList(
  computed(() => achievements.value.volunteering),
  PAGE_SIZE.volunteering,
  lang,
)
const awards = usePagedList(
  computed(() => achievements.value.awards),
  PAGE_SIZE.awards,
  lang,
)

interface Lightbox {
  open: boolean
  images: string[]
  index: number
  title: string
}

const icons: Record<string, Component> = { Trophy, Medal, Award }

const lightbox = ref<Lightbox>({ open: false, images: [], index: 0, title: '' })

function openLightbox(images: string[], title: string) {
  lightbox.value = { open: true, images, index: 0, title }
}
function closeLightbox() {
  lightbox.value.open = false
}
function nextImage() {
  lightbox.value.index = (lightbox.value.index + 1) % lightbox.value.images.length
}
function prevImage() {
  lightbox.value.index =
    (lightbox.value.index - 1 + lightbox.value.images.length) % lightbox.value.images.length
}
function onKeydown(e: KeyboardEvent) {
  if (!lightbox.value.open) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') nextImage()
  else if (e.key === 'ArrowLeft') prevImage()
}
window.addEventListener('keydown', onKeydown)
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
