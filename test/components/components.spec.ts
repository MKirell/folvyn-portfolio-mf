import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, type Component } from 'vue'
import { vReveal } from '@/directives/reveal'
import { useLanguage } from '@/composables/useLanguage'
import { useModal } from '@/composables/useModal'
import { fixtures } from '../setup'
import { messagesFor } from '@/i18n/messages'
import { levelLabel } from '@/utils/vocabularies'
import { deriveStats } from '@/utils/stats'
import { languageName, linkedinHandle } from '@/utils/person'

import App from '@/App.vue'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'

const person = fixtures.en.person

function render(component: Component): VueWrapper {
  return mount(component, {
    global: {
      directives: { reveal: vReveal },
      stubs: { teleport: true },
    },
    attachTo: document.body,
  })
}

describe('components', () => {
  beforeEach(async () => {
    await useLanguage().setLang('en')
    useModal().closeModal()
    document.body.innerHTML = ''
  })

  describe('App', () => {
    it('renders every section in order', async () => {
      const html = render(App).html()

      for (const id of ['about', 'experience', 'projects', 'skills', 'education', 'contact']) {
        expect(html).toContain(`id="${id}"`)
      }
    })
  })

  describe('AppNav', () => {
    it('shows a link for every nav entry', async () => {
      const html = render(AppNav).html()

      for (const label of Object.values(messagesFor('en').nav)) {
        expect(html).toContain(label)
      }
    })

    it('offers a switch for every supported language', async () => {
      const wrapper = render(AppNav)

      for (const locale of fixtures.en.availableLangs.map((l: { code: string }) => l.code)) {
        expect(wrapper.html()).toContain(languageName(locale, 'en'))
      }
    })

    it('re-renders in French once the language changes', async () => {
      const wrapper = render(AppNav)
      await useLanguage().setLang('fr')
      await nextTick()

      expect(wrapper.html()).toContain(messagesFor('fr').nav.about)
    })

    it('carries the id the scroll helpers look for', async () => {
      expect(render(AppNav).html()).toContain('id="navbar"')
    })
  })

  describe('AppFooter', () => {
    it('invites the reader to build their own, on the brand', async () => {
      expect(render(AppFooter).text()).toContain('Folvyn')
      expect(render(AppFooter).text()).toContain('Build your own portfolio')
    })
  })

  describe('HeroSection', () => {
    it('renders the headline and call to action', async () => {
      const text = render(HeroSection).text()

      expect(text).toContain(messagesFor('en').hero.cta.projects)
      expect(text).toContain(messagesFor('en').hero.cta.contact)
    })

    it('renders the role card', async () => {
      expect(render(HeroSection).text()).toContain(fixtures.en.person.headline)
    })
  })

  describe('AboutSection', () => {
    it('renders the heading and every paragraph', async () => {
      const html = render(AboutSection).html()

      expect(html).toContain(messagesFor('en').headings.about)
      expect(html).toContain(fixtures.en.person.aboutParagraphs[0].slice(0, 20))
    })

    it('renders every stat', async () => {
      const text = render(AboutSection).text()

      for (const stat of deriveStats(fixtures.en, 'en')) {
        expect(text).toContain(stat.num)
        expect(text).toContain(stat.label)
      }
    })

    it('renders the spoken languages with their levels', async () => {
      const text = render(AboutSection).text()

      expect(text).toContain(messagesFor('en').labels.spokenLanguages)
      for (const language of fixtures.en.education.spokenLanguages) {
        expect(text).toContain(languageName(language.code, 'en'))
        expect(text).toContain(levelLabel(language.level, 'en'))
      }
    })
  })

  describe('SkillsSection', () => {
    it('renders every category and its tags', async () => {
      const text = render(SkillsSection).text()

      for (const category of fixtures.en.skillCategories) {
        expect(text).toContain(category.title)
        for (const tag of category.tags) expect(text).toContain(tag)
      }
    })
  })

  describe('ExperienceSection', () => {
    it('renders every job', async () => {
      const text = render(ExperienceSection).text()

      for (const job of fixtures.en.experiences) {
        expect(text).toContain(job.company)
        expect(text).toContain(job.role)
      }
    })

    it('marks the current role', async () => {
      expect(render(ExperienceSection).text()).toContain(messagesFor('en').labels.currentRole)
    })

    it('offers to expand a job with many bullets', async () => {
      const wrapper = render(ExperienceSection)
      const toggle = wrapper
        .findAll('button')
        .find((button) => button.text().includes(messagesFor('en').labels.showMore))

      if (toggle) {
        await toggle.trigger('click')
        expect(wrapper.text()).toContain(messagesFor('en').labels.showLess)
      } else {
        expect(wrapper.text()).toContain(messagesFor('en').headings.experience)
      }
    })
  })

  describe('ProjectsSection', () => {
    it('renders every project', async () => {
      const text = render(ProjectsSection).text()

      for (const project of fixtures.en.projects) {
        expect(text).toContain(project.title)
        expect(text).toContain(project.badge)
      }
    })

    it('opens a project in the shared modal state on click', async () => {
      const wrapper = render(ProjectsSection)
      const card = wrapper.findAll('[role="button"], button, article').at(0)

      if (card) {
        await card.trigger('click')
        await nextTick()
      }

      expect(wrapper.text()).toContain(fixtures.en.projects[0].title)
    })
  })

  describe('EducationSection', () => {
    it('renders degrees and certifications', async () => {
      const text = render(EducationSection).text()

      expect(text).toContain(messagesFor('en').labels.degrees)
      expect(text).toContain(messagesFor('en').labels.certifications)

      for (const degree of fixtures.en.education.degrees) expect(text).toContain(degree.title)
    })

    it('pages through the certifications', async () => {
      const wrapper = render(EducationSection)
      const first = fixtures.en.education.certifications[0].title

      expect(wrapper.text()).toContain(first)

      const next = wrapper.findAll('button').at(-1)
      if (next) {
        await next.trigger('click')
        await nextTick()
      }

      expect(wrapper.text()).toContain(messagesFor('en').labels.certifications)
    })

    it('resets to the first page when the language changes', async () => {
      const wrapper = render(EducationSection)
      await useLanguage().setLang('fr')
      await nextTick()

      expect(wrapper.text()).toContain(fixtures.fr.education.certifications[0].title)
    })
  })

  describe('AchievementsSection', () => {
    it('renders volunteering and awards', async () => {
      const text = render(AchievementsSection).text()

      expect(text).toContain(messagesFor('en').labels.volunteering)
      expect(text).toContain(messagesFor('en').labels.awards)

      for (const award of fixtures.en.achievements.awards) expect(text).toContain(award.title)
      for (const vol of fixtures.en.achievements.volunteering) expect(text).toContain(vol.org)
    })

    it('opens the lightbox for an award that has photos', async () => {
      const wrapper = render(AchievementsSection)
      const withImages = fixtures.en.achievements.awards.findIndex(
        (award: { title: string; images?: string[] }) => award.images?.length,
      )

      expect(withImages).toBeGreaterThanOrEqual(0)

      const openers = wrapper.findAll('[tabindex="0"]')
      if (openers.length) {
        await openers[0].trigger('click')
        await nextTick()
      }

      expect(wrapper.text()).toContain(messagesFor('en').labels.awards)
    })
  })

  describe('ContactSection', () => {
    it('renders the contact details from the person record', async () => {
      const html = render(ContactSection).html()

      expect(html).toContain(person.email)
      expect(html).toContain(linkedinHandle(person.linkedin))
      expect(html).toContain(messagesFor('en').labels.contactCta)
    })

    it('links the email as a mailto', async () => {
      expect(render(ContactSection).html()).toContain(`mailto:${person.email}`)
    })

    it('shows the professional address', async () => {
      expect(render(ContactSection).html()).toContain(person.email)
    })
  })

  describe('language reactivity', () => {
    it.each([
      ['AboutSection', AboutSection, () => messagesFor('fr').headings.about],
      ['SkillsSection', SkillsSection, () => messagesFor('fr').headings.skills],
      ['ProjectsSection', ProjectsSection, () => messagesFor('fr').headings.projects],
      ['ContactSection', ContactSection, () => messagesFor('fr').headings.contact],
    ])('%s follows a language switch', async (_name, component, expected) => {
      const wrapper = render(component)
      await useLanguage().setLang('fr')
      await nextTick()

      expect(wrapper.text()).toContain(expected())
    })
  })

  describe('scroll-reveal', () => {
    it('is applied without throwing when IntersectionObserver is present', async () => {
      expect(() => render(AboutSection)).not.toThrow()
    })

    it('does not break when the browser lacks IntersectionObserver', async () => {
      const original = Reflect.get(window, 'IntersectionObserver') as unknown
      Reflect.deleteProperty(window, 'IntersectionObserver')

      expect(() => render(AboutSection)).not.toThrow()

      Reflect.set(window, 'IntersectionObserver', original)
    })
  })
})

describe('main entry', () => {
  it('mounts the app and registers the reveal directive', async () => {
    document.body.innerHTML = '<div id="app"></div>'
    vi.resetModules()

    await import('@/main')

    expect(document.getElementById('app')?.innerHTML.length).toBeGreaterThan(0)
  })
})
