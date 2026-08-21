<template>
  <nav
    id="navbar"
    class="fixed top-0 left-0 right-0 z-[100] grid grid-cols-[1fr_auto_1fr] items-center gap-6 max-700:flex max-700:gap-2 px-pad max-700:px-4 transition-[height] motion-reduce:transition-none before:content-[''] before:absolute before:inset-0 before:-z-10 before:transition-[background-color,backdrop-filter,border-color] motion-reduce:before:transition-none"
    :class="
      scrolled
        ? 'h-16 max-700:h-14 before:bg-bg/82 before:backdrop-blur-[18px] before:border-b before:border-line/7'
        : 'h-[72px] max-700:h-14 before:bg-transparent before:border-b before:border-transparent'
    "
    :aria-label="a11y.mainNavigation"
  >
    <a
      href="#main-content"
      class="flex items-center shrink-0 justify-self-start"
      :aria-label="`${BRAND} – go to top`"
    >
      <img :src="logoUrl" :alt="BRAND" class="h-8 max-700:h-7 w-auto block" />
    </a>

    <div
      v-if="menuOpen"
      class="fixed inset-0 z-[98] bg-scrim/60 backdrop-blur-[2px]"
      @click="menuOpen = false"
    ></div>

    <div
      id="navDrawer"
      class="contents max-700:fixed max-700:top-0 max-700:right-0 max-700:bottom-0 max-700:w-[266px] max-700:bg-bg/97 max-700:backdrop-blur-[20px] max-700:flex max-700:flex-col max-700:justify-center max-700:items-center max-700:gap-9 max-700:p-10 max-700:border-s max-700:border-line/7 max-700:z-[99] max-700:transition-transform max-700:duration-300 motion-reduce:transition-none"
      :class="menuOpen ? 'max-700:translate-x-0' : 'max-700:translate-x-full'"
    >
      <ul
        id="navLinks"
        class="flex gap-1 items-center justify-center max-700:flex-col max-700:gap-7 max-700:w-full"
        role="list"
      >
        <li v-for="[key, label] in navItems" :key="key" class="contents max-700:block">
          <a
            :href="`#${key}`"
            class="group relative flex items-center px-2 py-1.5 text-ink-soft transition-colors duration-300 ease-out motion-reduce:transition-none hover:text-ink after:content-[''] after:absolute after:bottom-0 after:inset-x-2 after:h-px after:bg-accent after:origin-left after:scale-x-0 after:transition-transform after:duration-[380ms] after:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:after:transition-none hover:after:scale-x-100 focus-visible:after:scale-x-100 max-700:justify-center max-700:px-1 max-700:py-1 max-700:after:inset-x-1"
            :class="activeSection === key ? 'text-ink after:!scale-x-100' : ''"
            :aria-current="activeSection === key ? 'true' : undefined"
            @click="onNavClick($event, key)"
          >
            <component
              :is="sectionIcons[key]"
              :size="19"
              :stroke-width="1.9"
              class="shrink-0 transition-transform duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none group-hover:scale-115 group-focus-visible:scale-115"
              :class="activeSection === key ? 'scale-115' : ''"
              aria-hidden="true"
            />
            <span
              class="grid transition-[grid-template-columns] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none max-700:!grid-cols-[1fr]"
              :class="
                activeSection === key
                  ? 'grid-cols-[1fr]'
                  : 'grid-cols-[0fr] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]'
              "
            >
              <span class="overflow-hidden">
                <span
                  class="block whitespace-nowrap origin-left text-[0.82rem] font-medium ps-2 max-700:ps-3 max-700:text-[1.02rem] transition-[opacity,translate,scale] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none max-700:!opacity-100 max-700:!translate-x-0 max-700:!scale-100"
                  :class="
                    activeSection === key
                      ? 'opacity-100 translate-x-0 scale-100'
                      : 'opacity-0 -translate-x-1 scale-50 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:scale-100'
                  "
                  >{{ label }}</span
                >
              </span>
            </span>
          </a>
        </li>
      </ul>

      <div
        class="flex items-center gap-2 shrink-0 justify-self-end max-700:w-full max-700:justify-center max-700:gap-4"
      >
        <button
          type="button"
          :aria-label="switchLabel"
          data-language-switch
          :title="localeName(otherLocale.code)"
          class="group relative inline-block shrink-0 cursor-pointer border-0 bg-transparent p-0 perspective-[600px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          @click="setLang(otherLocale.code)"
        >
          <Transition
            enter-active-class="transition-transform duration-[420ms] ease-[cubic-bezier(0.34,1.2,0.5,1)] motion-reduce:transition-none"
            leave-active-class="absolute inset-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.34,1.2,0.5,1)] motion-reduce:transition-none"
            enter-from-class="[transform:rotateY(-90deg)]"
            leave-to-class="[transform:rotateY(90deg)]"
          >
            <span
              :key="activeLocale.code"
              class="inline-flex transform-3d items-center gap-[6px] whitespace-nowrap rounded-[8px] border border-accent/[0.38] bg-accent/[0.14] px-[10px] py-[5px] font-mono text-[0.72rem] text-accent-deep backface-hidden transition-colors motion-reduce:transition-none group-active:scale-90"
            >
              <span
                class="inline-block h-[13px] w-[18px] shrink-0 rounded-[2px] bg-cover bg-center bg-no-repeat"
                :style="{ backgroundImage: `url(&quot;${flagUrl(activeLocale.flagCode)}&quot;)` }"
              ></span>
              {{ activeLocale.code.toUpperCase() }}
            </span>
          </Transition>
        </button>
        <button
          type="button"
          role="switch"
          :aria-checked="isLight"
          :aria-label="isLight ? 'Switch to dark theme' : 'Switch to light theme'"
          :title="isLight ? 'Switch to dark theme' : 'Switch to light theme'"
          class="group relative inline-flex h-8 w-[60px] shrink-0 items-center overflow-hidden rounded-full border border-line/12 p-[3px] cursor-pointer transition-[background-color,box-shadow] duration-500 ease-out motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          :class="
            isLight
              ? 'bg-gradient-to-r from-surface via-gold/25 to-accent/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.10)]'
              : 'bg-gradient-to-r from-bg via-surface to-surface-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)]'
          "
          @click="toggleTheme"
        >
          <span
            class="pointer-events-none absolute right-2 top-1.5 h-2 w-2 rounded-full bg-surface transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none"
            :class="isLight ? 'opacity-90 scale-100' : 'opacity-0 scale-0'"
            aria-hidden="true"
          ></span>
          <span
            class="pointer-events-none absolute right-5 top-3.5 h-1 w-1 rounded-full bg-surface transition-[opacity,transform] delay-100 duration-700 ease-out motion-reduce:transition-none"
            :class="isLight ? 'opacity-80 scale-100' : 'opacity-0 scale-0'"
            aria-hidden="true"
          ></span>
          <span
            v-for="star in stars"
            :key="star.top + star.left"
            class="pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-ink animate-pulse transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:animate-none"
            :style="{ top: star.top, left: star.left, animationDelay: star.delay }"
            :class="isLight ? 'opacity-0 scale-0' : 'opacity-90 scale-100'"
            aria-hidden="true"
          ></span>
          <span
            class="relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none group-active:scale-90"
            :class="isLight ? 'translate-x-0 bg-surface' : 'translate-x-[28px] bg-surface-2'"
          >
            <Sun
              :size="13"
              :stroke-width="2.2"
              class="absolute text-gold transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
              :class="
                isLight ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-[0.4]'
              "
              aria-hidden="true"
            />
            <Moon
              :size="12"
              :stroke-width="2.2"
              class="absolute text-accent-deep transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
              :class="
                isLight ? 'opacity-0 -rotate-90 scale-[0.4]' : 'opacity-100 rotate-0 scale-100'
              "
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
    </div>

    <button
      id="burger"
      class="hidden max-700:flex max-700:z-[100] max-700:ms-auto items-center justify-center text-ink bg-transparent border-0 cursor-pointer p-[6px] -mr-[6px]"
      :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="menuOpen"
      aria-controls="navDrawer"
      @click="menuOpen = !menuOpen"
    >
      <component :is="menuOpen ? X : Menu" :size="24" :stroke-width="2" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, type Component } from 'vue'
import {
  Menu,
  X,
  User,
  Briefcase,
  FolderGit2,
  Wrench,
  GraduationCap,
  Sparkles,
  Send,
  Sun,
  Moon,
} from '@lucide/vue'
import { useLanguage } from '@/composables/useLanguage'
import { languageName } from '@/utils/person'
import { useTheme } from '@/composables/useTheme'
import { flagUrl } from '@/utils/flags'
import { BRAND } from '@/config/app'
import { brandLogo } from '@/utils/logo'
import { fill, useMessages, useA11y } from '@/i18n'
import { isPlainClick, navHeight, scrollToSection, sectionScrollTop } from '@/utils/scroll'
import { usePortfolioStore } from '@/stores/portfolio'
import type { SectionKey } from '@/utils/sections'

const a11y = useA11y()
const t = useMessages()

const store = usePortfolioStore()

const navItems = computed(() =>
  Object.entries(t.value.nav).filter(([key]) => store.shows(key as SectionKey)),
)

const sectionIcons: Record<string, Component> = {
  about: User,
  experience: Briefcase,
  projects: FolderGit2,
  skills: Wrench,
  education: GraduationCap,
  achievements: Sparkles,
  contact: Send,
}

const { lang, setLang, availableLangs } = useLanguage()

function localeName(code: string): string {
  return languageName(code, lang.value)
}

const switchLabel = computed(() =>
  fill(a11y.value.switchLanguage, {
    current: localeName(activeLocale.value.code),
    next: localeName(otherLocale.value.code),
  }),
)
const { theme, toggleTheme } = useTheme()
const isLight = computed(() => theme.value === 'light')

const activeLangIndex = computed(() =>
  Math.max(
    0,
    availableLangs.value.findIndex(
      (l: { code: string; flagCode: string }) => l.code === lang.value,
    ),
  ),
)
const activeLocale = computed(() => availableLangs.value[activeLangIndex.value])
const otherLocale = computed(
  () => availableLangs.value[(activeLangIndex.value + 1) % availableLangs.value.length],
)
const logoUrl = computed(() => brandLogo(isLight.value))

const stars = [
  { top: '6px', left: '9px', delay: '0ms' },
  { top: '17px', left: '16px', delay: '250ms' },
  { top: '10px', left: '24px', delay: '500ms' },
]

const SCROLLED_AT = 40

const scrolled = ref(false)
const menuOpen = ref(false)
const activeSection = ref('')

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}

async function onNavClick(e: MouseEvent, key: string) {
  if (!isPlainClick(e) || !document.getElementById(key)) return

  e.preventDefault()
  if (menuOpen.value) {
    menuOpen.value = false
    await nextTick()
  }
  scrollToSection(key)
  activeSection.value = key
}

function updateActiveSection() {
  const keys = navItems.value.map(([key]) => key)
  if (!keys.length) return

  const doc = document.documentElement
  if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
    activeSection.value = keys[keys.length - 1]
    return
  }

  const line = navHeight() + 12
  let current = ''
  for (const key of keys) {
    const el = document.getElementById(key)
    if (!el) continue
    const { top, bottom } = el.getBoundingClientRect()
    if (top <= line && bottom > line) {
      current = key
      break
    }
  }
  activeSection.value = current
}

let frame = 0

function onScroll() {
  scrolled.value = window.scrollY > SCROLLED_AT
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    updateActiveSection()
  })
}

function onResize() {
  if (window.innerWidth > 700) menuOpen.value = false
  updateActiveSection()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
  scrolled.value = window.scrollY > SCROLLED_AT
  updateActiveSection()

  const key = decodeURIComponent(location.hash.slice(1))
  const el = key ? document.getElementById(key) : null
  if (el && key in sectionIcons) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: sectionScrollTop(el), behavior: 'auto' })
      updateActiveSection()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  if (frame) cancelAnimationFrame(frame)
  document.body.style.overflow = ''
})
</script>
