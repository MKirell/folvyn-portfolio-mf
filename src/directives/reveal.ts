import type { Directive } from 'vue'
import { track } from '@/composables/useAnalytics'

const HIDDEN = ['opacity-0', 'translate-y-7']
const SHOWN = ['opacity-100', 'translate-y-0']

export const vReveal: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    el.classList.add(
      'transition-all',
      'duration-[600ms]',
      'ease-out',
      'motion-reduce:transition-none',
      'motion-reduce:opacity-100',
      'motion-reduce:translate-y-0',
      ...HIDDEN,
    )
    if (!('IntersectionObserver' in window)) {
      revealNow(el)
      return
    }
    const section = binding.value
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealNow(el)
          if (section) track('section', { target: section })
          obs.unobserve(el)
        }
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
  },
}

function revealNow(el: HTMLElement): void {
  el.classList.remove(...HIDDEN)
  el.classList.add(...SHOWN)
}
