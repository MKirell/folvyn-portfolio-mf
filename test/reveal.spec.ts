import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { vReveal } from '@/directives/reveal'
import { MockIntersectionObserver } from './setup'

function mountRevealed() {
  return mount(
    { template: '<p v-reveal>content</p>' },
    { global: { directives: { reveal: vReveal } } },
  )
}

describe('v-reveal', () => {
  afterEach(() => {
    MockIntersectionObserver.instances.length = 0
    vi.unstubAllGlobals()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  it('starts hidden and offset', () => {
    const el = mountRevealed().element

    expect(el.classList.contains('opacity-0')).toBe(true)
    expect(el.classList.contains('translate-y-7')).toBe(true)
  })

  it('applies the transition and respects reduced motion', () => {
    const el = mountRevealed().element

    expect(el.classList.contains('transition-all')).toBe(true)
    expect(el.classList.contains('motion-reduce:transition-none')).toBe(true)
    expect(el.classList.contains('motion-reduce:opacity-100')).toBe(true)
  })

  it('watches the element once mounted', () => {
    const el = mountRevealed().element
    const observer = MockIntersectionObserver.instances.at(-1)

    expect(observer?.observe).toHaveBeenCalledWith(el)
  })

  it('stays hidden while the element is off screen', () => {
    const el = mountRevealed().element
    MockIntersectionObserver.instances.at(-1)?.trigger(false, el)

    expect(el.classList.contains('opacity-0')).toBe(true)
    expect(el.classList.contains('opacity-100')).toBe(false)
  })

  it('reveals the element when it scrolls into view', () => {
    const el = mountRevealed().element
    MockIntersectionObserver.instances.at(-1)?.trigger(true, el)

    expect(el.classList.contains('opacity-100')).toBe(true)
    expect(el.classList.contains('translate-y-0')).toBe(true)
    expect(el.classList.contains('opacity-0')).toBe(false)
  })

  it('stops observing after revealing so it only animates once', () => {
    const el = mountRevealed().element
    const observer = MockIntersectionObserver.instances.at(-1)
    observer?.trigger(true, el)

    expect(observer?.unobserve).toHaveBeenCalledWith(el)
  })

  it('shows content immediately when the browser has no IntersectionObserver', () => {
    vi.unstubAllGlobals()
    const original = Reflect.get(window, 'IntersectionObserver') as unknown
    Reflect.deleteProperty(window, 'IntersectionObserver')

    const el = mountRevealed().element

    expect(el.classList.contains('opacity-100')).toBe(true)

    Reflect.set(window, 'IntersectionObserver', original)
  })
})
