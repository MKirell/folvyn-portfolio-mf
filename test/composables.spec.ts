import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useLanguage } from '@/composables/useLanguage'
import { useModal } from '@/composables/useModal'
import { useTypewriter } from '@/composables/useTypewriter'
import { usePortfolioStore } from '@/stores/portfolio'
import type { ApiProject } from '@/types/api'
import { messagesFor } from '@/i18n/messages'

const project: ApiProject = {
  id: 'p1',
  order: 0,
  period: '2025',
  badge: 'Hybrid RAG',
  title: 'CVision',
  desc: 'A thing',
  tags: ['RAG'],
  link: null,
}

describe('useLanguage', () => {
  const { lang, setLang, availableLangs } = useLanguage()
  const store = usePortfolioStore()

  beforeEach(async () => {
    await setLang('en')
  })

  it('exposes every locale declared in the data', async () => {
    expect(availableLangs.value.map((locale) => locale.code)).toEqual(['en', 'fr'])
  })

  it('resolves the payload for the active language', async () => {
    await setLang('fr')

    expect(lang.value).toBe('fr')
    expect(messagesFor(store.lang).nav.about).toBeTruthy()
    expect(store.experiences.length).toBeGreaterThan(0)
  })

  it('switches back and swaps the whole tree', async () => {
    await setLang('fr')
    const french = messagesFor(store.lang).headings.about
    await setLang('en')

    expect(messagesFor(store.lang).headings.about).not.toBe(french)
  })

  it('mirrors the language onto the document element for assistive tech', async () => {
    await setLang('fr')
    await nextTick()

    expect(document.documentElement.lang).toBe('fr')
  })

  it('persists the choice so a reload keeps it', async () => {
    await setLang('fr')
    await nextTick()

    expect(localStorage.getItem('portfolio_lang')).toBe('fr')
  })

  it('records the language in the URL without reloading', async () => {
    await setLang('fr')
    expect(new URL(location.href).searchParams.get('lang')).toBe('fr')
  })

  it('ignores an unsupported language', async () => {
    setLang('de' as never)
    expect(lang.value).toBe('en')
  })

  it('ignores a no-op switch to the current language', async () => {
    const before = location.href
    await setLang('en')

    expect(lang.value).toBe('en')
    expect(location.href).toBe(before)
  })
})

describe('useModal', () => {
  const { modal, openModal, closeModal } = useModal()

  beforeEach(async () => {
    closeModal()
  })

  it('starts closed with nothing selected', async () => {
    expect(modal.open).toBe(false)
  })

  it('opens on a project and remembers which one', async () => {
    openModal(project, 2)

    expect(modal.open).toBe(true)
    expect(modal.project).toEqual(project)
    expect(modal.index).toBe(2)
  })

  it('closes on demand', async () => {
    openModal(project, 0)
    closeModal()

    expect(modal.open).toBe(false)
  })

  it('closes on Escape while open', async () => {
    openModal(project, 0)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(modal.open).toBe(false)
  })

  it('ignores other keys', async () => {
    openModal(project, 0)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(modal.open).toBe(true)
  })

  it('shares one state across every caller', async () => {
    openModal(project, 1)

    expect(useModal().modal.open).toBe(true)
  })
})

describe('useTypewriter', () => {
  function mountTypewriter(phrases: string[]) {
    const phrasesRef = ref(phrases)
    let display: { value: string } | undefined

    const wrapper = mount(
      defineComponent({
        setup() {
          display = useTypewriter(phrasesRef).display
          return () => null
        },
      }),
    )

    return { wrapper, phrasesRef, display: display as { value: string } }
  }

  beforeEach(async () => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('types the first phrase one character at a time', async () => {
    const { display } = mountTypewriter(['Hi'])

    expect(display.value).toBe('H')
    vi.advanceTimersByTime(55)
    expect(display.value).toBe('Hi')
  })

  it('deletes the phrase after holding it', async () => {
    const { display } = mountTypewriter(['Hi'])

    vi.advanceTimersByTime(55)
    expect(display.value).toBe('Hi')

    vi.advanceTimersByTime(1500)
    expect(display.value).toBe('H')
  })

  it('advances to the next phrase once the previous is erased', async () => {
    const { display } = mountTypewriter(['Hi', 'Yo'])

    vi.advanceTimersByTime(55)
    vi.advanceTimersByTime(1500)
    vi.advanceTimersByTime(28)
    expect(display.value).toBe('')

    vi.advanceTimersByTime(350)
    expect(display.value).toBe('Y')
  })

  it('wraps back to the first phrase after the last', async () => {
    const { display } = mountTypewriter(['A', 'B'])

    vi.advanceTimersByTime(2000)
    vi.advanceTimersByTime(2000)
    vi.advanceTimersByTime(2000)

    expect(['A', 'B', '']).toContain(display.value)
  })

  it('renders nothing for an empty phrase list', async () => {
    const { display } = mountTypewriter([])

    expect(display.value).toBe('')
  })

  it('restarts from scratch when the phrases change', async () => {
    const { display, phrasesRef } = mountTypewriter(['Hello'])

    vi.advanceTimersByTime(110)
    phrasesRef.value = ['Bonjour']
    await nextTick()

    expect(display.value).toBe('B')
  })

  it('stops its timer when the component goes away', async () => {
    const { wrapper, display } = mountTypewriter(['Hello'])

    wrapper.unmount()
    const settled = display.value
    vi.advanceTimersByTime(5000)

    expect(display.value).toBe(settled)
  })
})
