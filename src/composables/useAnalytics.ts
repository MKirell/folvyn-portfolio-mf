import { currentSlug } from '@/utils/slug'
import { visitorId } from '@/composables/useConsent'

export type AnalyticsEventType =
  | 'session'
  | 'section'
  | 'dwell'
  | 'scroll'
  | 'impression'
  | 'click'
  | 'doc'
  | 'outbound'
  | 'contact'
  | 'lang'
  | 'theme'
  | 'shell'
  | 'vitals'
  | 'error'

export interface AnalyticsEvent {
  type: AnalyticsEventType
  target?: string
  value?: number
  path?: string
  lang?: string
  referrer?: string
  device?: 'desktop' | 'tablet' | 'mobile'
}

const ENDPOINT = '/collect'
const SESSION_KEY = 'portfolio_session'
const OPT_OUT_KEY = 'portfolio_noanalytics'
const FLUSH_MS = 15_000
const MAX_BATCH = 20
const MAX_TARGET = 120
const SCROLL_DEPTHS = [25, 50, 75, 100] as const

const queue: AnalyticsEvent[] = []
const reachedDepths = new Set<number>()

let enabled = false
let started = false
let sessionId = ''
let timer = 0
let dwellFrom = 0

function readSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const created = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return crypto.randomUUID()
  }
}

function optedOut(): boolean {
  try {
    if (new URLSearchParams(location.search).has('noanalytics')) {
      localStorage.setItem(OPT_OUT_KEY, '1')
      return true
    }
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}

function doNotTrack(): boolean {
  const flag = navigator.doNotTrack ?? (window as { doNotTrack?: string }).doNotTrack
  return flag === '1' || flag === 'yes'
}

function deviceClass(): 'desktop' | 'tablet' | 'mobile' {
  const width = window.innerWidth
  if (width <= 700) return 'mobile'
  return width <= 1024 ? 'tablet' : 'desktop'
}

function trim(value: string | undefined): string | undefined {
  return value ? value.slice(0, MAX_TARGET) : undefined
}

export function track(type: AnalyticsEventType, event: Omit<AnalyticsEvent, 'type'> = {}): void {
  if (!enabled) return

  queue.push({
    type,
    target: trim(event.target),
    value: event.value === undefined ? undefined : Math.max(0, Math.round(event.value)),
    path: trim(event.path),
    lang: event.lang,
    referrer: trim(event.referrer),
    device: event.device,
  })

  if (queue.length >= MAX_BATCH) flush()
}

export function flush(): void {
  if (!enabled || queue.length === 0) return

  const events = queue.splice(0, MAX_BATCH)
  const body = JSON.stringify({
    sessionId,
    visitorId: visitorId() ?? undefined,
    slug: currentSlug() ?? undefined,
    events,
  })

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  } catch {
    void 0
  }
}

function observeVitals(): void {
  if (typeof PerformanceObserver === 'undefined') return

  const record = (target: string, value: number): void => track('vitals', { target, value })

  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) record('lcp', last.startTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        record('inp', (entry as PerformanceEventTiming).duration)
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit)

    let shift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layout = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
        if (!layout.hadRecentInput) shift += layout.value
      }
      record('cls', Math.round(shift * 1000))
    }).observe({ type: 'layout-shift', buffered: true })

    const [navigation] = performance.getEntriesByType('navigation')
    if (navigation) record('ttfb', (navigation as PerformanceNavigationTiming).responseStart)
  } catch {
    void 0
  }
}

export function scrollDepth(scrollY: number, viewport: number, page: number): number {
  const scrollable = page - viewport
  if (scrollable <= 0) return 100
  return Math.round(((scrollY + viewport) / page) * 100)
}

function observeScroll(): void {
  let scheduled = false

  const measure = (): void => {
    scheduled = false
    const depth = scrollDepth(
      window.scrollY,
      window.innerHeight,
      document.documentElement.scrollHeight,
    )

    for (const quartile of SCROLL_DEPTHS) {
      if (depth < quartile || reachedDepths.has(quartile)) continue
      reachedDepths.add(quartile)
      track('scroll', { value: quartile })
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(measure)
    },
    { passive: true },
  )

  measure()
}

function observeErrors(): void {
  window.addEventListener('error', (event) => {
    track('error', { target: event.message, path: location.pathname })
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string } | undefined
    track('error', { target: reason?.message ?? 'unhandled rejection', path: location.pathname })
  })
}

function observeClicks(): void {
  document.addEventListener(
    'click',
    (event) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const href = anchor.getAttribute('href') ?? ''

      if (href.includes('/files/')) {
        track('doc', { target: href.split('/files/')[1]?.split('#')[0]?.split('/').pop() })
        return
      }
      if (href.startsWith('mailto:')) return track('contact', { target: 'email' })
      if (href.startsWith('tel:')) return track('contact', { target: 'phone' })

      if (/^https?:\/\//.test(href)) {
        try {
          const host = new URL(href).hostname.replace(/^www\./, '')
          if (host === location.hostname) return
          if (/linkedin\.com$/.test(host)) return track('contact', { target: 'linkedin' })
          if (/github\.com$/.test(host)) return track('contact', { target: 'github' })
          if (/google\.[a-z.]+$/.test(host) && href.includes('maps'))
            return track('contact', { target: 'maps' })
          track('outbound', { target: host })
        } catch {
          void 0
        }
      }
    },
    { capture: true, passive: true },
  )
}

export function startAnalytics(lang: string): void {
  if (started) return
  started = true

  if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') return
  if (doNotTrack() || optedOut()) return

  enabled = true
  sessionId = readSessionId()
  dwellFrom = Date.now()

  track('session', {
    path: location.pathname,
    lang,
    referrer: document.referrer || undefined,
    device: deviceClass(),
  })

  observeVitals()
  observeErrors()
  observeClicks()
  observeScroll()

  timer = window.setInterval(flush, FLUSH_MS)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return
    track('dwell', { value: Date.now() - dwellFrom })
    flush()
  })
}

export function stopAnalytics(): void {
  clearInterval(timer)
  enabled = false
  started = false
  queue.length = 0
  reachedDepths.clear()
}

export interface UseAnalytics {
  track: typeof track
  flush: typeof flush
  isEnabled: () => boolean
}

export function useAnalytics(): UseAnalytics {
  return { track, flush, isEnabled: () => enabled }
}
