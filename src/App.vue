<template>
  <div v-if="store.ready">
    <a
      href="#main-content"
      class="absolute -top-249.75 left-0 bg-accent text-white px-5 py-2.5 text-sm font-semibold z-9999 rounded-bl-[14px] focus:top-0"
      >{{ a11y.skipToMain }}</a
    >
    <AppNav />
    <main id="main-content">
      <HeroSection :tinted="store.tinted('hero')" />
      <AboutSection :tinted="store.tinted('about')" />
      <ExperienceSection v-if="store.shows('experience')" :tinted="store.tinted('experience')" />
      <ProjectsSection v-if="store.shows('projects')" :tinted="store.tinted('projects')" />
      <SkillsSection v-if="store.shows('skills')" :tinted="store.tinted('skills')" />
      <EducationSection v-if="store.shows('education')" :tinted="store.tinted('education')" />
      <AchievementsSection
        v-if="store.shows('achievements')"
        :tinted="store.tinted('achievements')"
      />
      <ContactSection :tinted="store.tinted('contact')" />
    </main>
    <AppFooter />

    <ConsentBanner />
  </div>

  <div
    v-else-if="!store.hasSlug"
    class="min-h-screen grid place-items-center px-6 text-center"
    role="main"
  >
    <div>
      <p class="font-disp text-2xl font-semibold tracking-tight">{{ BRAND }}</p>
      <p class="mt-2 text-sm opacity-70">Portfolios live at {{ origin }}/your-name.</p>
    </div>
  </div>

  <div v-else-if="store.error" class="grid min-h-screen place-items-center px-5" role="main">
    <div class="w-full max-w-[440px]">
      <div class="rounded-lg border border-line/10 bg-surface p-6 text-center">
        <span class="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            class="h-6 w-6 text-accent"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" stroke-linecap="round" />
            <path d="M12 16.5h.01" stroke-linecap="round" />
          </svg>
        </span>

        <h1 class="font-disp text-[1.3rem] font-semibold tracking-tight">
          {{ a11y.loadFailed }}
        </h1>

        <p class="mt-2 text-[0.85rem] leading-relaxed opacity-70">{{ store.error }}</p>

        <button
          class="mt-5 inline-flex w-full items-center justify-center rounded-[9px] bg-accent px-3.5 py-[7px] text-[0.82rem] font-medium text-white"
          @click="store.load(lang || undefined)"
        >
          {{ a11y.retry }}
        </button>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen grid place-items-center" role="status" aria-live="polite">
    <span class="sr-only">{{ a11y.loading }}</span>
    <span
      class="h-8 w-8 rounded-full border-2 border-current border-t-transparent animate-spin opacity-40"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ConsentBanner from '@/components/layout/ConsentBanner.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { BRAND } from '@/config/app'
import { usePortfolioStore } from '@/stores/portfolio'
import { startAnalytics } from '@/composables/useAnalytics'
import { initConsent, type ConsentMode } from '@/composables/useConsent'
import { useSyncedAnimations } from '@/composables/useSyncedAnimations'
import { syncUiLang, useA11y } from '@/i18n'

const a11y = useA11y()
const store = usePortfolioStore()
const origin = typeof location === 'undefined' ? 'mkirell.com' : location.host
const { lang } = useLanguage()

useSyncedAnimations()
syncUiLang()

onMounted(async () => {
  await store.load(lang.value || undefined)
  if (store.data) lang.value = store.data.lang
  initConsent((store.data?.consentMode as ConsentMode) ?? 'measurement')
  startAnalytics(lang.value)
})
</script>
