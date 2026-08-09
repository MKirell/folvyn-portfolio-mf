import { beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { config } from '@vue/test-utils'
import en from './fixtures/portfolio.en.json'
import fr from './fixtures/portfolio.fr.json'
import type { ApiPortfolio } from '@/types/api'

export const fixtures = {
  en: en as unknown as ApiPortfolio,
  fr: fr as unknown as ApiPortfolio,
}

vi.mock('@/services/portfolio.api', () => ({
  ApiError: class ApiError extends Error {},
  fetchPortfolio: vi.fn((_slug: string, lang?: string) =>
    Promise.resolve(lang === 'fr' ? fixtures.fr : fixtures.en),
  ),
  fetchLanguages: vi.fn(() => Promise.resolve(fixtures.en.availableLangs)),
}))

window.history.replaceState({}, '', '/fol/mohamed-khalil-zrelly')

const pinia = createPinia()
setActivePinia(pinia)
config.global.plugins = [pinia]

beforeEach(async () => {
  const { usePortfolioStore } = await import('@/stores/portfolio')
  await usePortfolioStore().load('en')
})

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly scrollMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  static instances: MockIntersectionObserver[] = []

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.thresholds = [Number(options?.threshold ?? 0)]
    MockIntersectionObserver.instances.push(this)
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])

  trigger(isIntersecting: boolean, target: Element): void {
    this.callback(
      [{ isIntersecting, target } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

export { MockIntersectionObserver }
