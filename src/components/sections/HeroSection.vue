<template>
  <div
    class="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_55%_45%_at_88%_6%,rgba(217,119,87,0.16),transparent_60%),radial-gradient(ellipse_45%_38%_at_6%_92%,rgba(110,127,92,0.12),transparent_60%)]"
    aria-hidden="true"
  ></div>
  <section
    id="hero"
    class="relative overflow-hidden max-w-container mx-auto min-h-[94vh] max-900:min-h-0 grid grid-cols-[1fr_408px] max-900:grid-cols-1 items-center gap-[72px] pt-[calc(theme(spacing.pad)+88px)] max-700:pt-[calc(theme(spacing.pad)+56px)] px-pad pb-24 max-900:pb-[60px]"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="hero-heading"
  >
    <div class="min-w-0">
      <h1
        id="hero-heading"
        class="font-disp text-[clamp(2.2rem,4.2vw,3.6rem)] font-semibold leading-[1.06] text-ink tracking-[-0.02em] mb-5"
      >
        {{ name }}
      </h1>

      <div
        class="font-mono text-[0.95rem] tracking-[0.02em] text-accent-deep min-h-[26px] mt-7 mb-[26px]"
      >
        <span>{{ display }}</span
        ><span class="animate-blink-cursor motion-reduce:animate-none text-accent-deep">|</span>
      </div>

      <p
        class="text-[1.08rem] text-ink-soft max-w-[560px] mb-[30px] leading-[1.85]"
        v-html="boldify(profile.tagline)"
      ></p>

      <div class="flex flex-wrap gap-[10px] mb-8">
        <span
          v-for="skill in profile.highlights"
          :key="skill"
          class="inline-flex items-center bg-surface-2 border border-line/7 rounded-sm px-[10px] py-1 text-[0.78rem] text-ink-soft font-mono transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep"
          :class="{
            '!bg-accent/[0.14] !border-accent/[0.38] !text-accent-deep':
              profile.highlightFocus?.includes(skill),
          }"
          >{{ skill }}</span
        >
      </div>

      <div class="flex gap-[14px] flex-wrap mb-11">
        <a
          href="#projects"
          class="inline-flex items-center gap-2 rounded px-[26px] py-[13px] font-body text-[0.92rem] font-semibold cursor-pointer transition motion-reduce:transition-none bg-accent text-white hover:bg-accent-deep hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(217,119,87,0.32)]"
          @click="onSectionLink($event, 'projects')"
          >{{ t.hero.cta.projects }}</a
        >
        <a
          href="#contact"
          class="inline-flex items-center gap-2 rounded px-[26px] py-[13px] font-body text-[0.92rem] font-semibold cursor-pointer transition motion-reduce:transition-none bg-transparent text-ink border border-line/12 hover:border-accent/[0.38] hover:text-accent-deep hover:bg-accent/[0.14]"
          @click="onSectionLink($event, 'contact')"
          >{{ t.hero.cta.contact }}</a
        >
      </div>
    </div>

    <div class="min-w-0 translate-y-[calc((8px-theme(spacing.pad))/2)] max-900:translate-y-0">
      <div
        ref="heroCardRef"
        class="bg-surface border border-line/7 rounded-lg overflow-hidden shadow-[0_36px_64px_-28px_rgba(0,0,0,0.5)]"
      >
        <div
          class="flex items-center gap-[10px] bg-surface-2 px-[22px] py-4 border-b border-line/7"
        >
          <span class="w-2 h-2 rounded-full bg-accent"></span>
          <span class="w-2 h-2 rounded-full bg-gold"></span>
          <span class="w-2 h-2 rounded-full bg-sage"></span>
          <span class="ms-auto text-muted text-[0.7rem] tracking-[0.04em] font-mono">{{
            shellOpen ? shellHeaderLabel : 'profile.json'
          }}</span>
        </div>
        <div class="px-[22px] pt-1.5 pb-2.5 flex flex-col">
          <div class="relative">
            <div
              class="transition-opacity duration-300 motion-reduce:transition-none"
              :class="shellOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'"
              :aria-hidden="shellOpen"
            >
              <div
                class="flex justify-between gap-4 py-3.5 border-b border-line/7 text-[0.86rem] text-ink"
              >
                <span
                  class="text-ink-soft font-mono text-[0.72rem] uppercase tracking-[0.08em] shrink-0"
                  >{{ t.hero.card.headline }}</span
                >
                <span class="text-ink font-medium text-end">{{ person.headline }}</span>
              </div>
              <div
                class="flex justify-between gap-4 py-3.5 border-b border-line/7 text-[0.86rem] text-ink"
              >
                <span
                  class="text-ink-soft font-mono text-[0.72rem] uppercase tracking-[0.08em] shrink-0"
                  >{{ t.hero.card.affiliation }}</span
                >
                <span class="text-ink font-medium text-end">{{ person.affiliation }}</span>
              </div>
              <div
                class="flex justify-between gap-4 py-3.5 border-b border-line/7 text-[0.86rem] text-ink"
              >
                <span
                  class="text-ink-soft font-mono text-[0.72rem] uppercase tracking-[0.08em] shrink-0"
                  >{{ t.hero.card.location }}</span
                >
                <span class="text-ink font-medium text-end">{{ location }}</span>
              </div>
              <div class="flex justify-between gap-4 py-3.5 text-[0.86rem] text-ink">
                <span
                  class="text-ink-soft font-mono text-[0.72rem] uppercase tracking-[0.08em] shrink-0"
                  >{{ t.hero.card.languages }}</span
                >
                <span class="text-ink font-medium text-end">{{
                  education.spokenLanguages.map((l) => l.name).join(' · ')
                }}</span>
              </div>
            </div>

            <div
              v-show="shellOpen"
              ref="shellScrollRef"
              class="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 font-mono text-[0.78rem] leading-[1.6] transition-opacity duration-300 motion-reduce:transition-none [scrollbar-width:thin] [scrollbar-color:var(--color-surface-2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-surface-2 [&::-webkit-scrollbar-thumb]:rounded-full"
              :class="shellOpen ? 'opacity-100' : 'opacity-0'"
            >
              <div
                v-for="line in shellLines"
                :key="line.id"
                class="whitespace-pre-wrap break-words min-h-[1.5em]"
              >
                <template v-if="line.kind === 'blank'">&nbsp;</template>
                <template v-else-if="line.kind === 'prompt'"
                  ><span class="text-sage max-700:hidden">{{ shellPromptLabel }}</span
                  ><span class="text-sage hidden max-700:inline">{{ shellPromptShort }}</span
                  ><span class="text-ink">{{ line.text }}</span></template
                >
                <span
                  v-else-if="line.kind === 'rich'"
                  :class="shellLineColor(line.kind)"
                  v-html="boldify(line.text)"
                ></span>
                <span v-else :class="shellLineColor(line.kind)">{{ line.text }}</span>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-[9px] pt-2.5 pb-1 mt-1.5 border-t border-line/7 text-[0.86rem] cursor-text"
            @click="openShell"
          >
            <label for="hero-shell-input" class="sr-only">Portfolio terminal command input</label>
            <span class="text-sage font-mono text-[0.72rem] uppercase tracking-[0.08em] shrink-0"
              ><span class="max-700:hidden">{{ shellPromptLabel }}</span
              ><span class="hidden max-700:inline">{{ shellPromptShort }}</span></span
            >
            <input
              id="hero-shell-input"
              ref="shellInputRef"
              v-model="shellInputValue"
              type="text"
              class="flex-1 min-w-0 bg-transparent border-0 outline-none font-mono text-[0.82rem] text-ink caret-accent placeholder:text-muted/60"
              :placeholder="shellPlaceholder"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              @focus="openShell"
              @keydown="onHeroShellKeydown"
            />
          </div>
        </div>
        <footer
          class="flex items-center gap-[10px] px-[22px] py-3.5 border-t border-line/7 bg-surface-2"
        >
          <a
            :href="person.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="w-[42px] h-[42px] flex items-center justify-center border border-line/7 rounded-[11px] text-ink-soft bg-surface transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep hover:bg-accent/[0.14] hover:-translate-y-0.5"
            aria-label="LinkedIn profile"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-[18px] h-[18px]">
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
          </a>
          <a
            :href="`mailto:${person.email}`"
            class="w-[42px] h-[42px] flex items-center justify-center border border-line/7 rounded-[11px] text-ink-soft bg-surface transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep hover:bg-accent/[0.14] hover:-translate-y-0.5"
            aria-label="Send email"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-[18px] h-[18px]"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 7 10 7 10-7" />
            </svg>
          </a>
          <a
            v-if="resumeUrl"
            :href="resumeUrl"
            target="_blank"
            rel="noopener noreferrer"
            :download="resumeFile"
            class="w-[42px] h-[42px] flex items-center justify-center border border-line/7 rounded-[6px] bg-accent text-white ml-auto transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep hover:bg-accent/[0.14] hover:-translate-y-0.5"
            aria-label="Download Resume / CV"
            title="Download CV"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-[18px] h-[18px]"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
          </a>
        </footer>
      </div>
    </div>

    <div
      class="absolute bottom-10 left-1/2 -translate-x-1/2 max-900:static max-900:translate-x-0 max-900:flex max-900:justify-center max-900:[grid-column:1/-1] max-900:mt-12"
    >
      <div class="w-[26px] h-10 border-2 border-line/12 rounded-[20px] flex justify-center pt-1.5">
        <div
          class="w-1 h-2 bg-accent rounded-[2px] animate-scroll-wheel motion-reduce:animate-none"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'
import { useShell, type ShellLineKind } from '@/composables/useShell'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { docUrl } from '@/utils/docs'
import { boldify } from '@/utils/text'
import { onSectionLink } from '@/utils/scroll'
import { countryName, fullName } from '@/utils/person'
import { useActiveLang, useMessages } from '@/i18n'

const store = usePortfolioStore()
const { education, person, profile } = storeToRefs(store)
const t = useMessages()
const activeLang = useActiveLang()

const location = computed(() =>
  [person.value.city, countryName(person.value.country, activeLang.value)]
    .filter(Boolean)
    .join(', '),
)

const name = computed(() => fullName(person.value))

const phrases = computed(() => profile.value.subtitles)
const { display } = useTypewriter(phrases)
const resumeFile = computed(() => person.value.resume ?? '')
const resumeUrl = computed(() => docUrl(resumeFile.value))

const {
  lines: shellLines,
  inputValue: shellInputValue,
  placeholder: shellPlaceholder,
  onKeydown: onShellKeydown,
  activate: activateShell,
} = useShell()
const shellOpen = ref(false)
const heroCardRef = ref<HTMLDivElement | null>(null)
const shellScrollRef = ref<HTMLDivElement | null>(null)
const shellInputRef = ref<HTMLInputElement | null>(null)
const shellPromptShort = '~$ '
const shellPromptLabel = computed(
  () => `${t.value.shell.promptUser}@${t.value.shell.promptHost}:~$ `,
)
const shellHeaderLabel = computed(() => `${t.value.shell.promptUser}@${t.value.shell.promptHost}`)

function shellLineColor(kind: ShellLineKind): string {
  switch (kind) {
    case 'heading':
    case 'error':
      return 'text-accent-deep'
    case 'dim':
      return 'text-muted'
    default:
      return 'text-ink-soft'
  }
}

function openShell(): void {
  if (window.getSelection()?.toString()) return
  shellOpen.value = true
  activateShell()
  nextTick(() => shellInputRef.value?.focus())
}

function onHeroShellKeydown(e: KeyboardEvent): void {
  onShellKeydown(e)
  if (e.key === 'Escape') shellOpen.value = false
}

function onDocumentClick(e: MouseEvent): void {
  if (!shellOpen.value) return
  if (heroCardRef.value && !heroCardRef.value.contains(e.target as Node)) {
    shellOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

watch(
  () => shellLines.value.length,
  () => {
    nextTick(() => {
      if (shellScrollRef.value) shellScrollRef.value.scrollTop = shellScrollRef.value.scrollHeight
    })
  },
)
</script>
