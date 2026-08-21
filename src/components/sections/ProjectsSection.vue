<template>
  <section
    id="projects"
    class="scroll-mt-16 max-700:scroll-mt-14 py-[110px] max-1200:py-20 max-700:py-14"
    :class="tinted ? 'bg-bg-tint' : ''"
    aria-labelledby="projects-heading"
  >
    <div class="w-full max-w-container mx-auto px-pad">
      <header v-reveal="'projects'" class="mb-12 max-1200:mb-10 max-700:mb-8">
        <div class="flex items-center gap-4 max-700:gap-3 mb-[22px]">
          <span
            class="flex items-center justify-center w-11 h-11 max-700:w-10 max-700:h-10 shrink-0 rounded-[12px] border border-accent/[0.28] bg-accent/[0.12] text-accent"
            aria-hidden="true"
          >
            <FolderGit2 :size="22" :stroke-width="1.8" />
          </span>
          <span class="font-mono text-[0.76rem] tracking-[0.12em] uppercase text-ink-soft">{{
            t.nav.projects
          }}</span>
        </div>
        <h2
          id="projects-heading"
          class="font-disp text-[clamp(1.9rem,3.2vw,2.7rem)] font-semibold text-ink tracking-[-0.01em]"
        >
          {{ t.headings.projects }}
        </h2>
      </header>
      <div v-if="paged.hasPages.value" class="flex min-h-[26px] justify-end mb-5">
        <PageControl
          :page="paged.page.value"
          :page-count="paged.pageCount.value"
          :label="t.nav.projects"
          @previous="paged.previous"
          @next="paged.next"
          @go="paged.go"
        />
      </div>
      <ul
        :key="paged.page.value"
        class="grid grid-cols-3 max-1200:grid-cols-2 max-900:grid-cols-1 gap-5"
        :aria-label="a11y.projectList"
        aria-live="polite"
      >
        <li
          v-for="(project, i) in paged.items.value"
          :key="project.title"
          v-reveal
          v-card="project.id"
          class="bg-surface border border-line/7 rounded-lg p-[30px] transition-[border-color,transform,box-shadow] motion-reduce:transition-none relative overflow-hidden hover:border-accent/[0.38] hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(0,0,0,0.4)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent before:opacity-0 before:transition-opacity motion-reduce:before:transition-none hover:before:opacity-100"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex flex-col gap-[6px]">
              <time class="text-[0.72rem] text-ink-soft font-mono">{{ span(project) }}</time>
            </div>
            <span
              class="bg-gold/[0.12] border border-[rgba(184,137,59,0.3)] rounded-[6px] px-[10px] py-[3px] text-[0.72rem] text-gold font-mono"
              >{{ project.badge }}</span
            >
          </div>
          <div class="flex items-center gap-[10px] mb-[14px]">
            <h3
              class="font-disp text-[1.3rem] font-semibold text-ink flex-1 min-w-0 inline-flex items-center gap-2"
            >
              {{ project.title }}
              <a
                v-if="project.link"
                :href="project.link || undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-gold opacity-60 shrink-0 transition-opacity motion-reduce:transition-none hover:opacity-100 animate-icon-hint"
                :title="a11y.viewGithub"
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
            </h3>
            <button
              type="button"
              class="inline-flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer text-gold opacity-60 shrink-0 transition-opacity motion-reduce:transition-none hover:opacity-100 animate-icon-hint"
              :title="a11y.viewFullDetails"
              :aria-label="a11y.viewFullProject"
              @click="openModal(project, i)"
            >
              <Maximize2 :size="14" />
            </button>
          </div>
          <p
            class="text-ink-soft text-[0.92rem] leading-[1.8] cursor-pointer line-clamp-2"
            :title="a11y.clickFullDetails"
            @click="openModal(project, i)"
            v-html="boldify(project.desc)"
          ></p>
        </li>
      </ul>
    </div>

    <Teleport to="body">
      <div
        v-if="modal.open && modal.project"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-scrim/[0.88] px-5 py-10 max-700:px-3 max-700:py-6"
        @click.self="closeModal"
      >
        <div
          class="relative bg-surface border border-line/7 rounded-lg p-[34px] max-700:p-6 max-w-[560px] w-full max-h-[85vh] max-h-[85dvh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          role="dialog"
          aria-modal="true"
          :aria-label="modal.project.title"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex flex-col gap-[6px]">
              <time class="text-[0.72rem] text-ink-soft font-mono">{{ span(modal.project) }}</time>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="bg-gold/[0.12] border border-[rgba(184,137,59,0.3)] rounded-[6px] px-[10px] py-[3px] text-[0.72rem] text-gold font-mono"
                >{{ modal.project.badge }}</span
              >
              <button
                class="flex items-center justify-center bg-transparent border-0 text-ink-soft cursor-pointer opacity-75 transition-opacity motion-reduce:transition-none hover:opacity-100"
                type="button"
                :aria-label="a11y.close"
                @click="closeModal"
              >
                <X :size="18" />
              </button>
            </div>
          </div>
          <div class="flex items-center gap-[10px] mb-[14px]">
            <h3
              class="font-disp text-[1.3rem] font-semibold text-ink flex-1 min-w-0 inline-flex items-center gap-2"
            >
              {{ modal.project.title }}
              <a
                v-if="modal.project?.link"
                :href="modal.project?.link || undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-gold opacity-60 shrink-0 transition-opacity motion-reduce:transition-none hover:opacity-100 animate-icon-hint"
                :title="a11y.viewGithub"
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
            </h3>
          </div>
          <p
            class="text-ink-soft text-[0.95rem] leading-[1.8] mb-[22px]"
            v-html="boldify(modal.project.desc)"
          ></p>
          <ul class="flex flex-wrap gap-[7px]" :aria-label="a11y.technologiesUsed">
            <li
              v-for="tag in modal.project.tags"
              :key="tag"
              class="inline-flex items-center bg-surface-2 border border-line/7 rounded-sm px-[10px] py-1 text-[0.78rem] text-ink-soft font-mono transition motion-reduce:transition-none hover:border-accent/[0.38] hover:text-accent-deep"
            >
              {{ tag }}
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
defineProps<{ tinted?: boolean }>()

import { useModal } from '@/composables/useModal'
import { useLanguage } from '@/composables/useLanguage'
import { usePagedList } from '@/composables/usePagedList'
import PageControl from '@/components/items/PageControl.vue'
import { PAGE_SIZE } from '@/config/app'
import { boldify } from '@/utils/text'
import { formatSpan } from '@/utils/period'
import type { ApiProject } from '@/types/api'
import { Maximize2, X, FolderGit2 } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useMessages, useA11y } from '@/i18n'

const a11y = useA11y()
const store = usePortfolioStore()
const t = useMessages()
const { projects } = storeToRefs(store)

const { lang } = useLanguage()

function span(project: ApiProject): string {
  return formatSpan(project.startDate, project.endDate, lang.value)
}
const paged = usePagedList(projects, PAGE_SIZE.projects, lang)

const { modal, openModal, closeModal } = useModal()
</script>
