import type { Directive } from 'vue'
import { track } from '@/composables/useAnalytics'

export const VISIBLE_FRACTION = 0.5
export const DWELL_MS = 1000

const IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/

const seen = new Set<string>()
const clicked = new WeakMap<HTMLElement, () => void>()
const observers = new WeakMap<HTMLElement, IntersectionObserver>()

export function cardId(value: string | undefined): string | null {
  if (!value) return null
  const id = value.trim()
  return IDENTIFIER.test(id) ? id : null
}

export function resetCards(): void {
  seen.clear()
}

export const vCard: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    const id = cardId(binding.value)
    if (!id) return

    const onClick = (): void => track('click', { target: id })
    el.addEventListener('click', onClick, { passive: true })
    clicked.set(el, onClick)

    if (seen.has(id) || !('IntersectionObserver' in window)) return

    let timer = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = window.setTimeout(() => {
            if (seen.has(id)) return
            seen.add(id)
            track('impression', { target: id })
            observer.disconnect()
          }, DWELL_MS)
          return
        }
        window.clearTimeout(timer)
      },
      { threshold: VISIBLE_FRACTION },
    )

    observer.observe(el)
    observers.set(el, observer)
  },

  unmounted(el) {
    const onClick = clicked.get(el)
    if (onClick) el.removeEventListener('click', onClick)
    observers.get(el)?.disconnect()
    clicked.delete(el)
    observers.delete(el)
  },
}
