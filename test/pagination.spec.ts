import { describe, it, expect, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { computed, nextTick, ref, type Component } from 'vue'
import { vReveal } from '@/directives/reveal'
import { useLanguage } from '@/composables/useLanguage'
import { usePagedList } from '@/composables/usePagedList'
import { usePortfolioStore } from '@/stores/portfolio'
import { PAGE_SIZE, EXPERIENCE_VISIBLE } from '@/config/pagination'
import { fixtures } from './setup'
import type { ApiExperience, ApiPortfolio } from '@/types/api'

import SkillsSection from '@/components/sections/SkillsSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import AchievementsSection from '@/components/sections/AchievementsSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'

function render(component: Component): VueWrapper {
  return mount(component, {
    global: { directives: { reveal: vReveal }, stubs: { teleport: true } },
    attachTo: document.body,
  })
}

function patch(changes: Partial<ApiPortfolio>): void {
  const store = usePortfolioStore()
  store.data = { ...(store.data as ApiPortfolio), ...changes }
}

function job(company: string, startDate: string, endDate: string | null): ApiExperience {
  return {
    ...(fixtures.en.experiences[0] as ApiExperience),
    company,
    startDate,
    endDate,
  }
}

beforeEach(async () => {
  await useLanguage().setLang('en')
  document.body.innerHTML = ''
})

describe('usePagedList', () => {
  it('slices the source into pages of the given size', () => {
    const source = ref([1, 2, 3, 4, 5])
    const paged = usePagedList(source, 2)

    expect(paged.pageCount.value).toBe(3)
    expect(paged.items.value).toEqual([1, 2])

    paged.next()
    expect(paged.items.value).toEqual([3, 4])

    paged.next()
    expect(paged.items.value).toEqual([5])
  })

  it('reports a single page for an exactly-full list, so no control renders', () => {
    const paged = usePagedList(ref([1, 2, 3, 4]), 4)

    expect(paged.pageCount.value).toBe(1)
    expect(paged.hasPages.value).toBe(false)
  })

  it('reports one page for an empty list rather than zero', () => {
    const paged = usePagedList(ref([]), 4)

    expect(paged.pageCount.value).toBe(1)
    expect(paged.items.value).toEqual([])
  })

  it('refuses to step past either end', () => {
    const paged = usePagedList(ref([1, 2, 3]), 2)

    paged.previous()
    expect(paged.page.value).toBe(0)

    paged.next()
    paged.next()
    expect(paged.page.value).toBe(1)
  })

  it('clamps an out-of-range jump instead of rendering nothing', () => {
    const paged = usePagedList(ref([1, 2, 3]), 2)

    paged.go(99)
    expect(paged.page.value).toBe(1)

    paged.go(-4)
    expect(paged.page.value).toBe(0)
  })

  it('pulls the page back when the list shrinks under it', async () => {
    const source = ref([1, 2, 3, 4, 5])
    const paged = usePagedList(source, 2)

    paged.go(2)
    expect(paged.items.value).toEqual([5])

    source.value = [1, 2]
    await nextTick()

    expect(paged.page.value).toBe(0)
    expect(paged.items.value).toEqual([1, 2])
  })

  it('returns to the first page when the reset dependency changes', async () => {
    const lang = ref('en')
    const paged = usePagedList(
      computed(() => [1, 2, 3, 4]),
      2,
      lang,
    )

    paged.next()
    expect(paged.page.value).toBe(1)

    lang.value = 'fr'
    await nextTick()

    expect(paged.page.value).toBe(0)
  })
})

describe('the page control appears only when it is needed', () => {
  it('stays hidden for a list that fits one page', () => {
    patch({ projects: fixtures.en.projects.slice(0, PAGE_SIZE.projects) })
    const wrapper = render(ProjectsSection)

    expect(wrapper.find('[aria-label="Next projects"]').exists()).toBe(false)
  })

  it('appears as soon as one item does not fit', async () => {
    const extra = [...fixtures.en.projects, { ...fixtures.en.projects[0], title: 'One more' }]
    patch({ projects: extra })
    const wrapper = render(ProjectsSection)
    await nextTick()

    expect(wrapper.find('[aria-label="Next projects"]').exists()).toBe(true)
    expect(wrapper.findAll('[aria-label^="Go to projects page"]')).toHaveLength(2)
  })

  it('pages projects without dropping or repeating one', async () => {
    const many = Array.from({ length: PAGE_SIZE.projects + 2 }, (_, i) => ({
      ...fixtures.en.projects[0],
      title: `Project ${i}`,
    }))
    patch({ projects: many })

    const wrapper = render(ProjectsSection)
    await nextTick()
    expect(wrapper.text()).toContain('Project 0')
    expect(wrapper.text()).not.toContain(`Project ${PAGE_SIZE.projects}`)

    await wrapper.find('[aria-label="Next projects"]').trigger('click')
    expect(wrapper.text()).toContain(`Project ${PAGE_SIZE.projects}`)
    expect(wrapper.text()).not.toContain('Project 0')
  })

  it('paginates skill categories above eight', async () => {
    const many = Array.from({ length: PAGE_SIZE.skillCategories + 1 }, (_, i) => ({
      ...fixtures.en.skillCategories[0],
      title: `Category ${i}`,
    }))
    patch({ skillCategories: many })

    const wrapper = render(SkillsSection)
    await nextTick()

    expect(wrapper.find('[aria-label="Next skill categories"]').exists()).toBe(true)
  })

  it('paginates degrees and certifications independently', async () => {
    const education = fixtures.en.education
    patch({
      education: {
        ...education,
        degrees: Array.from({ length: PAGE_SIZE.degrees + 1 }, (_, i) => ({
          ...education.degrees[0],
          title: `Degree ${i}`,
        })),
      },
    })

    const wrapper = render(EducationSection)
    await nextTick()

    expect(wrapper.find('[aria-label="Next degrees"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Next certifications"]').exists()).toBe(true)

    await wrapper.find('[aria-label="Next degrees"]').trigger('click')
    expect(wrapper.text()).toContain(`Degree ${PAGE_SIZE.degrees}`)
  })

  it('paginates awards and volunteering', async () => {
    const achievements = fixtures.en.achievements
    patch({
      achievements: {
        ...achievements,
        awards: Array.from({ length: PAGE_SIZE.awards + 1 }, (_, i) => ({
          ...achievements.awards[0],
          title: `Award ${i}`,
        })),
        volunteering: Array.from({ length: PAGE_SIZE.volunteering + 1 }, (_, i) => ({
          ...achievements.volunteering[0],
          org: `Org ${i}`,
        })),
      },
    })

    const wrapper = render(AchievementsSection)
    await nextTick()

    expect(wrapper.find('[aria-label="Next awards"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Next volunteering"]').exists()).toBe(true)
  })
})

describe('experience folding', () => {
  it('changes nothing at exactly three experiences', async () => {
    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-01', '2024-01'),
        job('Three', '2022-01', '2023-01'),
      ],
    })

    const wrapper = render(ExperienceSection)
    await nextTick()

    expect(wrapper.text()).toContain('One')
    expect(wrapper.text()).toContain('Two')
    expect(wrapper.text()).toContain('Three')
    expect(wrapper.text()).not.toContain('earlier roles')
  })

  it('folds the tail into a summary from the fourth experience on', async () => {
    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-01', '2024-01'),
        job('Three', '2022-01', '2023-01'),
        job('Four', '2021-01', '2022-01'),
      ],
    })

    const wrapper = render(ExperienceSection)
    await nextTick()

    expect(wrapper.text()).toContain('2 earlier roles')
    expect(wrapper.text()).toContain('Three, Four')
    expect(wrapper.text()).toContain('2021 — 2023')
  })

  it('keeps the first two experiences visible while the rest are folded', async () => {
    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-01', '2024-01'),
        job('Three', '2022-01', '2023-01'),
        job('Four', '2021-01', '2022-01'),
      ],
    })

    const wrapper = render(ExperienceSection)
    await nextTick()

    expect(wrapper.findAll('ol > li')).toHaveLength(EXPERIENCE_VISIBLE)
  })

  it('reveals the folded roles as their own cards when expanded', async () => {
    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-01', '2024-01'),
        job('Three', '2022-01', '2023-01'),
        job('Four', '2021-01', '2022-01'),
      ],
    })

    const wrapper = render(ExperienceSection)
    await nextTick()

    await wrapper.find('[aria-label*="earlier roles, Show earlier experience"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).not.toContain('2 earlier roles')
    expect(wrapper.text()).toContain('Three')
    expect(wrapper.text()).toContain('Four')
  })

  it('folds back up again', async () => {
    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-01', '2024-01'),
        job('Three', '2022-01', '2023-01'),
        job('Four', '2021-01', '2022-01'),
      ],
    })

    const wrapper = render(ExperienceSection)
    await nextTick()

    await wrapper.find('[aria-label*="earlier roles, Show earlier experience"]').trigger('click')
    await nextTick()
    await wrapper.find('[aria-label*="earlier roles, Show less"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('2 earlier roles')
  })

  it('reads a single folded year as one year, not a range', async () => {
    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-06', '2023-09'),
        job('Three', '2023-01', '2023-03'),
      ],
    })

    const wrapper = render(ExperienceSection)
    await nextTick()
    expect(wrapper.text()).not.toContain('earlier roles')

    patch({
      experiences: [
        job('One', '2024-01', null),
        job('Two', '2023-06', '2023-09'),
        job('Three', '2023-01', '2023-03'),
        job('Four', '2023-02', '2023-04'),
      ],
    })

    const later = render(ExperienceSection)
    await nextTick()
    expect(later.text()).toContain('2023')
    expect(later.text()).not.toContain('2023 — 2023')
  })
})

describe('skill tags', () => {
  it('renders the tags in the order the author gave them', async () => {
    patch({
      skillCategories: [
        {
          ...fixtures.en.skillCategories[0],
          title: 'Only category',
          tags: ['Third', 'First', 'Second'],
          accentTags: ['First'],
        },
      ],
    })

    const wrapper = render(SkillsSection)
    await nextTick()

    const tags = wrapper.findAll('ul[aria-label="Technologies"] li').map((li) => li.text())
    expect(tags).toEqual(['Third', 'First', 'Second'])
  })

  it('accentTags a tag that is also an accent tag, and leaves the others plain', async () => {
    patch({
      skillCategories: [
        {
          ...fixtures.en.skillCategories[0],
          title: 'Only category',
          tags: ['Plain', 'Accented'],
          accentTags: ['Accented'],
        },
      ],
    })

    const wrapper = render(SkillsSection)
    await nextTick()

    const items = wrapper.findAll('ul[aria-label="Technologies"] li')
    expect(items[0].classes().join(' ')).not.toContain('!text-accent-deep')
    expect(items[1].classes().join(' ')).toContain('!text-accent-deep')
  })
})
