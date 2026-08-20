import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ConsentBanner from '@/components/layout/ConsentBanner.vue'
import {
  CONSENT_KEY,
  VISITOR_KEY,
  initConsent,
  useConsent,
  visitorId,
  withdraw,
} from '@/composables/useConsent'

beforeEach(() => {
  localStorage.clear()
  withdraw()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function button(wrapper: VueWrapper, label: RegExp) {
  const found = wrapper.findAll('button').find((node) => label.test(node.text()))
  if (!found) throw new Error(`No button matching ${label}`)
  return found
}

describe('consent, tier one', () => {
  it('never asks when the owner measures without a banner', () => {
    initConsent('measurement')
    const consent = useConsent()

    expect(consent.needsBanner.value).toBe(false)
    expect(consent.accepted.value).toBe(false)
  })

  it('mints no persistent identifier without an explicit yes', () => {
    initConsent('measurement')

    expect(visitorId()).toBeNull()
    expect(localStorage.getItem(VISITOR_KEY)).toBeNull()
  })

  it('does not render the banner when the owner never enabled it', () => {
    initConsent('measurement')
    const wrapper = mount(ConsentBanner)

    expect(wrapper.find('[role="region"]').exists()).toBe(false)
  })
})

describe('consent, tier two', () => {
  it('asks once when the owner enabled the enhanced mode', () => {
    initConsent('enhanced')

    expect(useConsent().needsBanner.value).toBe(true)
  })

  it('keeps one identifier across visits once accepted', () => {
    initConsent('enhanced')
    useConsent().accept()

    const first = visitorId()
    const second = visitorId()

    expect(first).toMatch(/^[a-f0-9]{32}$/)
    expect(second).toBe(first)
    expect(localStorage.getItem(CONSENT_KEY)).toBe('accepted')
  })

  it('mints nothing and stores nothing when refused', () => {
    initConsent('enhanced')
    useConsent().refuse()

    expect(visitorId()).toBeNull()
    expect(localStorage.getItem(VISITOR_KEY)).toBeNull()
    expect(useConsent().needsBanner.value).toBe(false)
  })

  it('deletes the identifier when consent is withdrawn', () => {
    initConsent('enhanced')
    useConsent().accept()
    expect(visitorId()).not.toBeNull()

    useConsent().withdraw()

    expect(localStorage.getItem(VISITOR_KEY)).toBeNull()
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull()
  })

  it('mints a fresh identifier once the stored one has expired', () => {
    initConsent('enhanced')
    useConsent().accept()
    const first = visitorId()

    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id: first, until: Date.now() - 1000 }))

    expect(visitorId()).not.toBe(first)
  })

  it('survives a tampered identifier rather than throwing', () => {
    initConsent('enhanced')
    useConsent().accept()
    localStorage.setItem(VISITOR_KEY, 'not-json')

    expect(visitorId()).toMatch(/^[a-f0-9]{32}$/)
  })

  it('shows the banner, and hides it the moment a choice is made', async () => {
    initConsent('enhanced')
    const wrapper = mount(ConsentBanner)

    expect(wrapper.find('[role="region"]').exists()).toBe(true)

    await button(wrapper, /count return visits/i).trigger('click')

    expect(useConsent().accepted.value).toBe(true)
    expect(useConsent().needsBanner.value).toBe(false)
  })

  it('offers refusal in one click, as prominently as acceptance', async () => {
    initConsent('enhanced')
    const wrapper = mount(ConsentBanner)

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)

    await button(wrapper, /stay anonymous/i).trigger('click')

    expect(useConsent().accepted.value).toBe(false)
    expect(useConsent().needsBanner.value).toBe(false)
  })

  it('never hides refusal behind an extra step', () => {
    initConsent('enhanced')
    const wrapper = mount(ConsentBanner)

    const [first, second] = wrapper.findAll('button')
    expect(first.classes().join(' ')).not.toContain('hidden')
    expect(second.classes().join(' ')).not.toContain('hidden')
  })
})
