<template>
  <div v-if="store.ready">
    <a
      href="#main-content"
      class="absolute -top-249.75 left-0 bg-accent text-white px-5 py-2.5 text-sm font-semibold z-9999 rounded-bl-[14px] focus:top-0"
      >Skip to main content</a
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

  <div v-else-if="store.error" class="min-h-screen grid place-items-center px-6 text-center">
    <div>
      <p class="text-lg font-semibold">This portfolio could not be loaded.</p>
      <p class="mt-2 text-sm opacity-70">{{ store.error }}</p>
      <button
        class="mt-6 bg-accent text-white px-5 py-2.5 text-sm font-semibold rounded-lg"
        @click="store.load(lang || undefined)"
      >
        Try again
      </button>
    </div>
  </div>

  <div v-else class="min-h-screen grid place-items-center" role="status" aria-live="polite">
    <span class="sr-only">Loading</span>
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
import { BRAND } from '@/brand'
import { usePortfolioStore } from '@/stores/portfolio'
import { startAnalytics } from '@/composables/useAnalytics'
import { initConsent, type ConsentMode } from '@/composables/useConsent'
import { useSyncedAnimations } from '@/composables/useSyncedAnimations'

const store = usePortfolioStore()
const origin = typeof location === 'undefined' ? 'mkirell.com' : location.host
const { lang } = useLanguage()

useSyncedAnimations()

onMounted(async () => {
  await store.load(lang.value || undefined)
  if (store.data) lang.value = store.data.lang
  initConsent((store.data?.consentMode as ConsentMode) ?? 'measurement')
  startAnalytics(lang.value)
})
</script>
