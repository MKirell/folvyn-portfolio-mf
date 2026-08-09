import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { DWELL_MS, VISIBLE_FRACTION, cardId, resetCards, vCard } from '@/directives/card'
import { startAnalytics, stopAnalytics } from '@/composables/useAnalytics'
import { MockIntersectionObserver } from './setup'

interface Beacon {
  events: { type: string; target?: string }[]
}

let payloads: Beacon[]

function mountCard(id: string | undefined) {
  return mount(
    { props: { id: String }, template: '<article v-card="id">card</article>' },
    { props: { id }, global: { directives: { card: vCard } } },
  )
}

async function drain(): Promise<Beacon['events']> {
  const { flush } = await import('@/composables/useAnalytics')
  flush()
  await Promise.resolve()
  await Promise.resolve()
  return payloads
    .flatMap((entry) => entry.events)
    .filter((event) => event.type === 'impression' || event.type === 'click')
}

beforeEach(() => {
  payloads = []
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  vi.stubGlobal('navigator', {
    ...navigator,
    doNotTrack: '0',
    sendBeacon: vi.fn((_url: string, body: Blob) => {
      void body.text().then((text: string) => payloads.push(JSON.parse(text) as Beacon))
      return true
    }),
  })
  vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
  vi.useFakeTimers()

  stopAnalytics()
  resetCards()
  MockIntersectionObserver.instances.length = 0
  startAnalytics('en')
})

afterEach(() => {
  vi.useRealTimers()
  stopAnalytics()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('card identifiers', () => {
  it('accepts the identifier shape the ingest allowlist accepts', () => {
    expect(cardId('68a1f0c2e4b0a1c2d3e4f5a6')).toBe('68a1f0c2e4b0a1c2d3e4f5a6')
    expect(cardId('  project-atlas  ')).toBe('project-atlas')
  })

  it('refuses anything that would widen a counter key', () => {
    expect(cardId(undefined)).toBeNull()
    expect(cardId('')).toBeNull()
    expect(cardId('a card')).toBeNull()
    expect(cardId('a'.repeat(65))).toBeNull()
  })
})

describe('v-card', () => {
  it('watches the card at half visibility', () => {
    mountCard('project-atlas')
    const observer = MockIntersectionObserver.instances.at(-1)

    expect(observer?.thresholds).toEqual([VISIBLE_FRACTION])
  })

  it('records nothing until the card has been visible long enough', async () => {
    const el = mountCard('project-atlas').element
    MockIntersectionObserver.instances.at(-1)?.trigger(true, el)

    vi.advanceTimersByTime(DWELL_MS - 1)
    expect(await drain()).toHaveLength(0)
  })

  it('records one impression once the card has been visible for a second', async () => {
    const el = mountCard('project-atlas').element
    MockIntersectionObserver.instances.at(-1)?.trigger(true, el)

    vi.advanceTimersByTime(DWELL_MS)

    expect(await drain()).toContainEqual({ type: 'impression', target: 'project-atlas' })
  })

  it('forgets a card that scrolled away before the second was up', async () => {
    const el = mountCard('project-atlas').element
    const observer = MockIntersectionObserver.instances.at(-1)

    observer?.trigger(true, el)
    vi.advanceTimersByTime(DWELL_MS - 100)
    observer?.trigger(false, el)
    vi.advanceTimersByTime(DWELL_MS)

    expect(await drain()).toHaveLength(0)
  })

  it('counts a card once per session however often it comes back', async () => {
    const first = mountCard('project-atlas')
    MockIntersectionObserver.instances.at(-1)?.trigger(true, first.element)
    vi.advanceTimersByTime(DWELL_MS)
    first.unmount()

    const second = mountCard('project-atlas')
    MockIntersectionObserver.instances.at(-1)?.trigger(true, second.element)
    vi.advanceTimersByTime(DWELL_MS)

    const impressions = (await drain()).filter((event) => event.type === 'impression')
    expect(impressions).toHaveLength(1)
  })

  it('records a click against the same identifier as the impression', async () => {
    const wrapper = mountCard('project-atlas')
    await wrapper.trigger('click')

    expect(await drain()).toContainEqual({ type: 'click', target: 'project-atlas' })
  })

  it('records a click every time, because a second look is a second signal', async () => {
    const wrapper = mountCard('project-atlas')
    await wrapper.trigger('click')
    await wrapper.trigger('click')

    const clicks = (await drain()).filter((event) => event.type === 'click')
    expect(clicks).toHaveLength(2)
  })

  it('does nothing at all for a card with no usable identifier', async () => {
    const wrapper = mountCard('not an id')
    await wrapper.trigger('click')

    expect(MockIntersectionObserver.instances).toHaveLength(0)
    expect(await drain()).toHaveLength(0)
  })

  it('stops listening once the card is gone', async () => {
    const wrapper = mountCard('project-atlas')
    const el = wrapper.element
    wrapper.unmount()

    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(await drain()).toHaveLength(0)
  })
})
