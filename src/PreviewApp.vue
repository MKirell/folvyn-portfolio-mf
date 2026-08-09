<template>
  <main v-if="ready" ref="rootRef" class="bg-bg text-ink [&_section]:!py-8">
    <component :is="section" v-if="section" />
    <p v-else class="font-mono text-[0.8rem] text-muted">No preview for "{{ requested }}".</p>
  </main>
  <p v-else class="font-mono text-[0.8rem] text-muted">Waiting for the editor…</p>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { currentLang } from '@/composables/useLanguage'
import AboutSection from '@/components/sections/AboutSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import type { ApiPortfolio } from '@/types/api'

const SECTIONS: Record<string, Component> = {
  person: AboutSection,
  profile: HeroSection,
  contact: ContactSection,
  experience: ExperienceSection,
  project: ProjectsSection,
  skillCategory: SkillsSection,
  degree: EducationSection,
  certification: EducationSection,
  spokenLanguage: AboutSection,
  volunteering: AchievementsSection,
  award: AchievementsSection,
}

const MESSAGE = 'folvyn:preview'

const store = usePortfolioStore()
const ready = ref(false)
const requested = ref('')

const rootRef = ref<HTMLElement | null>(null)
let embedder = ''
let sizeObserver: ResizeObserver | null = null

function reportHeight(): void {
  if (!embedder) return

  const content = rootRef.value
  if (!content) return

  const measured = Math.ceil(content.getBoundingClientRect().height)
  if (measured > 0) {
    window.parent?.postMessage({ type: `${MESSAGE}:rendered`, height: measured }, embedder)
  }
}

const section = computed(() => SECTIONS[requested.value])

function allowedOrigins(): string[] {
  return String(import.meta.env.VITE_PREVIEW_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function isLocal(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}

function onMessage(event: MessageEvent): void {
  const origins = allowedOrigins()
  const trusted =
    event.origin === window.location.origin ||
    origins.includes(event.origin) ||
    (import.meta.env.DEV && isLocal(event.origin)) ||
    origins.length === 0
  if (!trusted) return

  const data = event.data as { type?: string; section?: string; payload?: ApiPortfolio }
  if (data?.type !== MESSAGE || !data.payload) return

  store.data = data.payload
  currentLang.value = data.payload.lang
  requested.value = data.section ?? ''
  ready.value = true

  embedder = event.origin
  void nextTick(() => {
    if (rootRef.value && sizeObserver) {
      sizeObserver.disconnect()
      sizeObserver.observe(rootRef.value)
    }
    reportHeight()
  })
}

onMounted(() => {
  window.addEventListener('message', onMessage)
  if (typeof ResizeObserver !== 'undefined') {
    sizeObserver = new ResizeObserver(reportHeight)
  }
  window.parent?.postMessage({ type: `${MESSAGE}:ready` }, '*')
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  sizeObserver?.disconnect()
})
</script>
