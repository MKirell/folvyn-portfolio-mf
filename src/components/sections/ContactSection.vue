<template>
  <section
    id="contact"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14 text-center"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="contact-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'contact'" class="mb-7">
        <div class="flex items-center justify-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <Send :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.contact
          }}</span>
        </div>
        <h2
          id="contact-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.contact }}
        </h2>
      </header>
      <p
        v-reveal
        class="text-ink-soft text-[1.06rem] max-w-[580px] mx-auto mb-[52px] leading-[1.85]"
        v-html="boldify(blurb)"
      ></p>

      <address
        v-reveal
        class="grid grid-cols-2 max-700:grid-cols-1 gap-4 max-w-[920px] mx-auto mb-2 text-start not-italic"
      >
        <a
          :href="`mailto:${person.email}`"
          class="flex items-center gap-4 bg-surface border border-line/7 rounded px-[22px] py-[19px] transition-[border-color,transform] motion-reduce:transition-none hover:border-accent/[0.38] hover:-translate-y-0.5"
        >
          <span
            class="w-10 h-10 flex items-center justify-center text-accent-deep shrink-0 rounded-[9px] bg-accent/[0.14]"
            aria-hidden="true"
          >
            <Mail :size="19" :stroke-width="1.8" />
          </span>
          <span class="flex flex-col">
            <span class="block text-[0.72rem] text-ink-soft mb-[2px] font-mono">{{
              t.labels.email
            }}</span>
            <span class="block text-[0.9rem] text-ink font-medium break-words">{{
              person.email
            }}</span>
          </span>
        </a>
        <a
          :href="`tel:${person.phone}`"
          class="flex items-center gap-4 bg-surface border border-line/7 rounded px-[22px] py-[19px] transition-[border-color,transform] motion-reduce:transition-none hover:border-accent/[0.38] hover:-translate-y-0.5"
        >
          <span
            class="w-10 h-10 flex items-center justify-center text-accent-deep shrink-0 rounded-[9px] bg-accent/[0.14]"
            aria-hidden="true"
          >
            <Phone :size="19" :stroke-width="1.8" />
          </span>
          <span class="flex flex-col">
            <span class="block text-[0.72rem] text-ink-soft mb-[2px] font-mono">{{
              t.labels.phone
            }}</span>
            <span class="block text-[0.9rem] text-ink font-medium break-words">{{
              displayPhone(person.phone)
            }}</span>
          </span>
        </a>
        <a
          :href="person.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 bg-surface border border-line/7 rounded px-[22px] py-[19px] transition-[border-color,transform] motion-reduce:transition-none hover:border-accent/[0.38] hover:-translate-y-0.5"
          :aria-label="t.labels.linkedin + ' - ' + name"
        >
          <span
            class="w-10 h-10 flex items-center justify-center text-accent-deep shrink-0 rounded-[9px] bg-accent/[0.14]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19">
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
          </span>
          <span class="flex flex-col">
            <span class="block text-[0.72rem] text-ink-soft mb-[2px] font-mono">{{
              t.labels.linkedin
            }}</span>
            <span class="block text-[0.9rem] text-ink font-medium break-words">{{
              linkedinHandle(person.linkedin)
            }}</span>
          </span>
        </a>
        <a
          :href="mapLink"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 bg-surface border border-line/7 rounded px-[22px] py-[19px] transition-[border-color,transform] motion-reduce:transition-none hover:border-accent/[0.38] hover:-translate-y-0.5"
          :aria-label="`${t.labels.location} - ${person.city}, ${country}`"
        >
          <span
            class="w-10 h-10 flex items-center justify-center text-accent-deep shrink-0 rounded-[9px] bg-accent/[0.14]"
            aria-hidden="true"
          >
            <MapPin :size="19" :stroke-width="1.8" />
          </span>
          <span class="flex flex-col">
            <span class="block text-[0.72rem] text-ink-soft mb-[2px] font-mono">{{
              t.labels.location
            }}</span>
            <span class="block text-[0.9rem] text-ink font-medium break-words"
              >{{ person.city }}, {{ country }}</span
            >
          </span>
        </a>
      </address>

      <a
        v-reveal
        :href="`mailto:${person.email}`"
        class="inline-flex items-center gap-2 rounded font-body font-semibold cursor-pointer transition motion-reduce:transition-none px-[38px] py-4 text-base mt-12 bg-accent text-white hover:bg-accent-deep hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(217,119,87,0.32)]"
      >
        {{ t.labels.contactCta }}
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { Mail, Phone, MapPin, Send } from '@lucide/vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useActiveLang, useMessages } from '@/i18n'
import {
  contactBlurb,
  countryName,
  displayPhone,
  fullName,
  linkedinHandle,
  mapsUrl,
} from '@/utils/person'
import { boldify } from '@/utils/text'

const store = usePortfolioStore()
const t = useMessages()
const activeLang = useActiveLang()
const { person } = storeToRefs(store)

const name = computed(() => fullName(person.value))
const blurb = computed(() => contactBlurb(person.value, t.value))
const mapLink = computed(() => mapsUrl(person.value.city, person.value.country, activeLang.value))
const country = computed(() => countryName(person.value.country, activeLang.value))
</script>
