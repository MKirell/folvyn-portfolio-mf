import { describe, it, expect, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, type Component } from 'vue'
import { vReveal } from '@/directives/reveal'
import { vCard } from '@/directives/card'
import { useLanguage } from '@/composables/useLanguage'
import { usePortfolioStore } from '@/stores/portfolio'
import { messagesFor } from '@/i18n/messages'
import { fixtures } from '../setup'
import type { ApiPortfolio } from '@/types/api'

import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'

const en = messagesFor('en')

function render(component: Component): VueWrapper {
  return mount(component, {
    global: { directives: { reveal: vReveal, card: vCard }, stubs: { teleport: true } },
    attachTo: document.body,
  })
}

function patch(changes: Partial<ApiPortfolio>): void {
  const store = usePortfolioStore()
  store.data = { ...(store.data as ApiPortfolio), ...changes }
}

beforeEach(async () => {
  await useLanguage().setLang('en')
  document.body.innerHTML = ''
})

describe('a section leaves out the half it has nothing for', () => {
  it('drops the awards column, heading included, when there is no award', async () => {
    patch({ achievements: { ...fixtures.en.achievements, awards: [] } })
    const wrapper = render(AchievementsSection)
    await nextTick()

    expect(wrapper.text()).toContain(en.labels.volunteering)
    expect(wrapper.text()).not.toContain(en.labels.awards)
  })

  it('drops the volunteering column when there is no volunteering', async () => {
    patch({ achievements: { ...fixtures.en.achievements, volunteering: [] } })
    const wrapper = render(AchievementsSection)
    await nextTick()

    expect(wrapper.text()).toContain(en.labels.awards)
    expect(wrapper.text()).not.toContain(en.labels.volunteering)
  })

  it('gives the surviving column the full width', async () => {
    patch({ achievements: { ...fixtures.en.achievements, awards: [] } })
    const wrapper = render(AchievementsSection)
    await nextTick()

    const grid = wrapper.get('div.grid')
    expect(grid.classes()).toContain('grid-cols-1')
    expect(grid.classes()).not.toContain('grid-cols-2')
  })

  it('drops the certifications column when there is no certification', async () => {
    patch({ education: { ...fixtures.en.education, certifications: [] } })
    const wrapper = render(EducationSection)
    await nextTick()

    expect(wrapper.text()).toContain(en.labels.degrees)
    expect(wrapper.text()).not.toContain(en.labels.certifications)
  })

  it('drops the degrees column when there is no degree', async () => {
    patch({ education: { ...fixtures.en.education, degrees: [] } })
    const wrapper = render(EducationSection)
    await nextTick()

    expect(wrapper.text()).toContain(en.labels.certifications)
    expect(wrapper.text()).not.toContain(en.labels.degrees)
  })

  it('leaves the spoken languages out of About when there are none', async () => {
    patch({ education: { ...fixtures.en.education, spokenLanguages: [] } })
    const wrapper = render(AboutSection)
    await nextTick()

    expect(wrapper.text()).not.toContain(en.labels.spokenLanguages)
  })
})

describe('the hero offers only what there is to open', () => {
  it('hides the projects button when there is no project', async () => {
    patch({ projects: [] })
    const wrapper = render(HeroSection)
    await nextTick()

    expect(wrapper.text()).not.toContain(en.hero.cta.projects)
    expect(wrapper.text()).toContain(en.hero.cta.contact)
  })

  it('shows the projects button as soon as there is one', async () => {
    patch({ projects: fixtures.en.projects })
    const wrapper = render(HeroSection)
    await nextTick()

    expect(wrapper.text()).toContain(en.hero.cta.projects)
  })

  it('hides the CV download when no CV has been published', async () => {
    patch({ person: { ...fixtures.en.person, resume: null } })
    const wrapper = render(HeroSection)
    await nextTick()

    expect(wrapper.find(`[aria-label="${en.a11y.downloadResume}"]`).exists()).toBe(false)
  })

  it('offers the CV download once one exists', async () => {
    patch({ person: fixtures.en.person })
    const wrapper = render(HeroSection)
    await nextTick()

    expect(wrapper.find(`[aria-label="${en.a11y.downloadResume}"]`).exists()).toBe(true)
  })

  it('leaves out a card row the owner has not filled in', async () => {
    patch({
      person: { ...fixtures.en.person, affiliation: '' },
      education: { ...fixtures.en.education, spokenLanguages: [] },
    })
    const wrapper = render(HeroSection)
    await nextTick()

    expect(wrapper.text()).toContain(en.hero.card.headline)
    expect(wrapper.text()).not.toContain(en.hero.card.affiliation)
    expect(wrapper.text()).not.toContain(en.hero.card.languages)
  })
})
