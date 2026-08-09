<template>
  <section
    id="about"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="about-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'about'" class="mb-12 max-1200:mb-10 max-700:mb-8">
        <div class="flex items-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <User :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.about
          }}</span>
        </div>
        <h2
          id="about-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.about }}
        </h2>
      </header>
      <div
        class="grid grid-cols-[1fr_1.05fr] max-1400:grid-cols-1 gap-14 max-1400:gap-10 max-700:gap-8 items-stretch"
      >
        <div v-reveal>
          <p
            v-for="(para, i) in person.aboutParagraphs"
            :key="i"
            class="text-ink-soft mb-5 last:mb-0 leading-[1.9] max-700:leading-[1.75] text-[1.03rem] max-700:text-[0.97rem]"
            v-html="boldify(para)"
          ></p>
        </div>
        <div v-reveal class="flex gap-10 max-700:flex-col max-700:gap-9 max-700:items-center">
          <figure
            class="group relative h-full max-1400:h-[320px] max-700:h-auto max-700:w-full max-700:max-w-[300px] aspect-square shrink-0 overflow-hidden rounded-lg border border-line/7 bg-surface shadow-[0_28px_56px_-28px_rgba(0,0,0,0.6)]"
          >
            <img
              :src="photoUrl"
              :alt="name"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover object-center saturate-[0.72] contrast-[1.06] transition-[filter,transform] duration-500 motion-reduce:transition-none group-hover:saturate-100 group-hover:scale-[1.03]"
            />
            <div
              class="absolute inset-0 bg-[linear-gradient(155deg,rgba(217,119,87,0.22),transparent_52%)]"
              aria-hidden="true"
            ></div>
            <div
              class="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,22,27,0.88)_0%,rgba(20,22,27,0.82)_14%,transparent_36%)]"
              aria-hidden="true"
            ></div>
            <figcaption class="absolute inset-x-0 bottom-0 px-4 pb-4">
              <p class="font-disp text-[1rem] font-semibold text-white leading-tight">
                {{ name }}
              </p>
              <p class="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[#f2a089] mt-1.5">
                {{ person.headline }}
              </p>
            </figcaption>
          </figure>
          <div class="flex flex-1 flex-col justify-between pl-1 max-700:w-full max-700:pl-0">
            <component
              :is="stat.anchor ? 'a' : 'div'"
              v-for="(stat, i) in stats"
              :key="i"
              :href="stat.anchor || undefined"
              class="group/stat flex flex-1 items-center gap-4 max-700:gap-3 max-700:py-4 border-b border-line/7 last:border-b-0 transition-[border-color] motion-reduce:transition-none hover:border-accent/[0.38]"
              :class="{ 'cursor-pointer': stat.anchor }"
              @click="onSectionLink($event, stat.anchor)"
            >
              <span
                class="font-disp text-[2.1rem] max-700:text-[1.8rem] font-semibold leading-none w-[72px] max-700:w-[62px] shrink-0 transition-transform duration-300 motion-reduce:transition-none group-hover/stat:translate-x-1"
                :class="statColorClasses[i]"
              >
                {{ statNums[i] }}
              </span>
              <span
                class="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-soft leading-relaxed transition-colors motion-reduce:transition-none group-hover/stat:text-ink"
              >
                {{ statLabels[i] }}
              </span>
              <span
                v-if="stat.anchor"
                class="ml-auto shrink-0 text-ink-soft opacity-0 -translate-y-1 max-700:opacity-100 max-700:translate-y-0 transition-[opacity,transform] duration-300 motion-reduce:transition-none group-hover/stat:opacity-100 group-hover/stat:translate-y-0"
                aria-hidden="true"
                >&darr;</span
              >
            </component>
          </div>
        </div>
      </div>

      <p
        class="font-mono text-[0.78rem] font-medium text-accent-deep tracking-[0.1em] uppercase mt-8 mb-[22px]"
      >
        {{ t.labels.spokenLanguages }}
      </p>
      <ul
        v-reveal
        class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] max-700:grid-cols-1 gap-8"
        aria-label="Language proficiency"
      >
        <SpokenLanguageRow
          v-for="langItem in education.spokenLanguages"
          :key="langItem.name"
          :item="langItem"
        />
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { computed } from 'vue'
import { User } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { imgUrl } from '@/utils/docs'
import SpokenLanguageRow from '@/components/items/SpokenLanguageRow.vue'
import { boldify } from '@/utils/text'
import { onSectionLink } from '@/utils/scroll'
import { fullName } from '@/utils/person'
import { useMessages } from '@/i18n'

const store = usePortfolioStore()
const { education, person, stats } = storeToRefs(store)
const t = useMessages()

const name = computed(() => fullName(person.value))
const photoUrl = computed(() => imgUrl(person.value.photo))
const statColorClasses = ['text-accent-deep', 'text-sage', 'text-gold', 'text-accent-deep']
const statNums = computed(() => stats.value.map((s) => s.num))
const statLabels = computed(() => stats.value.map((s) => s.label))
</script>
