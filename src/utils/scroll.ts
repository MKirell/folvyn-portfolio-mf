const FALLBACK_NAV_HEIGHT = 64

export const LANDING_GAP = 24

export function navHeight(): number {
  return document.getElementById('navbar')?.offsetHeight ?? FALLBACK_NAV_HEIGHT
}

export function sectionScrollTop(el: HTMLElement): number {
  const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || navHeight()
  const rect = el.getBoundingClientRect()
  let target = rect.top + window.scrollY - offset

  if (rect.height > window.innerHeight - offset) {
    const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0
    target += Math.max(0, padTop - LANDING_GAP)
  }
  return Math.max(0, target)
}

export function scrollToSection(key: string): boolean {
  const el = document.getElementById(key)
  if (!el) return false

  window.scrollTo({ top: sectionScrollTop(el), behavior: 'auto' })
  history.replaceState(null, '', `#${key}`)
  return true
}

export function isPlainClick(e: MouseEvent): boolean {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
}

export function onSectionLink(e: MouseEvent, target?: string | null): void {
  if (!target || !isPlainClick(e)) return
  if (scrollToSection(target.replace(/^#/, ''))) e.preventDefault()
}
