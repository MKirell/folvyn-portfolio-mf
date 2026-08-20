import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  flush,
  scrollDepth,
  startAnalytics,
  stopAnalytics,
  track,
  useAnalytics,
} from '@/composables/useAnalytics'

interface Beacon {
  sessionId: string
  slug?: string
  events: { type: string; target?: string; value?: number; lang?: string }[]
}

let beacon: ReturnType<typeof vi.fn>
let payloads: Beacon[]

beforeEach(() => {
  payloads = []
  beacon = vi.fn((_url: string, body: Blob) => {
    void body.text().then((text: string) => payloads.push(JSON.parse(text) as Beacon))
    return true
  })

  vi.stubGlobal('navigator', {
    ...navigator,
    sendBeacon: beacon,
    doNotTrack: '0',
    userAgent: 'Mozilla/5.0 Chrome/120',
  })
  vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')

  sessionStorage.clear()
  localStorage.clear()
  stopAnalytics()
})

afterEach(() => {
  stopAnalytics()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

async function drain(): Promise<Beacon[]> {
  flush()
  await Promise.resolve()
  await Promise.resolve()
  return payloads
}

describe('collector activation', () => {
  it('stays silent until it is started', () => {
    track('section', { target: 'projects' })
    flush()

    expect(beacon).not.toHaveBeenCalled()
    expect(useAnalytics().isEnabled()).toBe(false)
  })

  it('opens a session and reports the entry context', async () => {
    startAnalytics('en')
    const [first] = await drain()

    expect(useAnalytics().isEnabled()).toBe(true)
    expect(first.events[0]).toMatchObject({ type: 'session', lang: 'en' })
    expect(first.slug).toBe('ada-lovelace')
    expect(first.sessionId).toMatch(/[0-9a-f-]{8}/)
  })

  it('reuses one session id for the life of the tab', () => {
    startAnalytics('en')
    const first = sessionStorage.getItem('portfolio_session')

    stopAnalytics()
    startAnalytics('en')

    expect(sessionStorage.getItem('portfolio_session')).toBe(first)
  })

  it('stays off when the build disables it', () => {
    vi.stubEnv('VITE_ANALYTICS_ENABLED', 'false')
    startAnalytics('en')

    expect(useAnalytics().isEnabled()).toBe(false)
  })

  it('honours Do Not Track', () => {
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: beacon, doNotTrack: '1' })
    startAnalytics('en')

    expect(useAnalytics().isEnabled()).toBe(false)
  })

  it('honours a stored opt-out', () => {
    localStorage.setItem('portfolio_noanalytics', '1')
    startAnalytics('en')

    expect(useAnalytics().isEnabled()).toBe(false)
  })
})

describe('event shape', () => {
  beforeEach(() => startAnalytics('en'))

  it('truncates an oversized target rather than dropping the event', async () => {
    track('error', { target: 'x'.repeat(400) })
    const beacons = await drain()
    const error = beacons.flatMap((entry) => entry.events).find((event) => event.type === 'error')

    expect(error?.target).toHaveLength(120)
  })

  it('rounds and floors a numeric value', async () => {
    track('dwell', { value: 1234.7 })
    const beacons = await drain()
    const dwell = beacons.flatMap((entry) => entry.events).find((event) => event.type === 'dwell')

    expect(dwell?.value).toBe(1235)
  })

  it('carries the command name and never the raw shell input', async () => {
    track('shell', { target: 'cat' })
    const beacons = await drain()
    const shell = beacons.flatMap((entry) => entry.events).find((event) => event.type === 'shell')

    expect(shell?.target).toBe('cat')
    expect(JSON.stringify(beacons)).not.toContain('sudo rm -rf')
  })

  it('flushes automatically once the batch cap is reached', () => {
    beacon.mockClear()
    for (let index = 0; index < 20; index += 1) track('section', { target: `s${index}` })

    expect(beacon).toHaveBeenCalled()
  })

  it('sends nothing when the queue is empty', () => {
    void drain()
    beacon.mockClear()
    flush()

    expect(beacon).not.toHaveBeenCalled()
  })

  it('reports dwell and flushes when the tab is hidden', async () => {
    await drain()
    beacon.mockClear()

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(beacon).toHaveBeenCalled()
  })
})

describe('payload budget', () => {
  it('keeps a full batch small enough for a beacon', async () => {
    startAnalytics('en')
    for (let index = 0; index < 19; index += 1) track('section', { target: `section-${index}` })

    const beacons = await drain()
    const size = new Blob([JSON.stringify(beacons[0])]).size

    expect(size).toBeLessThan(4096)
  })
})

describe('scroll depth', () => {
  function page(scrollY: number, viewport = 800, height = 4000): void {
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: viewport, configurable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: height,
      configurable: true,
    })
  }

  it('reads the fraction of the page that has been seen', () => {
    expect(scrollDepth(0, 800, 4000)).toBe(20)
    expect(scrollDepth(1200, 800, 4000)).toBe(50)
    expect(scrollDepth(3200, 800, 4000)).toBe(100)
  })

  it('calls a page shorter than the viewport fully read', () => {
    expect(scrollDepth(0, 900, 600)).toBe(100)
  })

  it('reports every quartile crossed, each exactly once', async () => {
    page(0)
    startAnalytics('en')

    page(1200)
    window.dispatchEvent(new Event('scroll'))
    await new Promise((resolve) => requestAnimationFrame(resolve))

    page(1300)
    window.dispatchEvent(new Event('scroll'))
    await new Promise((resolve) => requestAnimationFrame(resolve))

    const depths = (await drain())
      .flatMap((entry) => entry.events)
      .filter((event) => event.type === 'scroll')
      .map((event) => event.value)

    expect(depths).toEqual([25, 50])
  })
})

describe('click classification', () => {
  beforeEach(() => startAnalytics('en'))

  function click(html: string): void {
    document.body.innerHTML = html
    document.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  it('records a document open by filename', async () => {
    click('<a href="/files/resume_en_ada-lovelace.pdf#view=FitV">CV</a>')
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events).toContainEqual(
      expect.objectContaining({ type: 'doc', target: 'resume_en_ada-lovelace.pdf' }),
    )
  })

  it('records contact channels by name, never by address', async () => {
    click('<a href="mailto:ada.lovelace@example.com">Mail</a>')
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events).toContainEqual(expect.objectContaining({ type: 'contact', target: 'email' }))
    expect(JSON.stringify(events)).not.toContain('ada.lovelace@example.com')
  })

  it('records a phone click as a channel', async () => {
    click('<a href="tel:+33612345678">Call</a>')
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events).toContainEqual(expect.objectContaining({ type: 'contact', target: 'phone' }))
  })

  it('separates known social profiles from generic outbound links', async () => {
    click('<a href="https://github.com/adalovelace">Code</a>')
    click('<a href="https://example.org/post">Post</a>')
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events).toContainEqual(expect.objectContaining({ type: 'contact', target: 'github' }))
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'outbound', target: 'example.org' }),
    )
  })

  it('ignores same-origin navigation and in-page anchors', async () => {
    click('<a href="#projects">Projects</a>')
    click(`<a href="${location.origin}/about">About</a>`)
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events.filter((event) => event.type === 'outbound')).toHaveLength(0)
  })
})

describe('error reporting', () => {
  beforeEach(() => startAnalytics('en'))

  it('records a runtime error message without its stack', async () => {
    window.dispatchEvent(
      new ErrorEvent('error', { message: 'TypeError: undefined is not a function' }),
    )
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events).toContainEqual(
      expect.objectContaining({ type: 'error', target: 'TypeError: undefined is not a function' }),
    )
    expect(JSON.stringify(events)).not.toContain('at ')
  })

  it('records an unhandled rejection', async () => {
    const event = new Event('unhandledrejection') as Event & { reason: unknown }
    event.reason = { message: 'boom' }
    window.dispatchEvent(event)
    const events = (await drain()).flatMap((entry) => entry.events)

    expect(events).toContainEqual(expect.objectContaining({ type: 'error', target: 'boom' }))
  })
})

describe('transport fallback', () => {
  it('falls back to a keepalive fetch when sendBeacon is unavailable', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true } as Response))
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: undefined, doNotTrack: '0' })
    vi.stubGlobal('fetch', fetchMock)

    startAnalytics('en')
    flush()

    expect(fetchMock).toHaveBeenCalledWith(
      '/collect',
      expect.objectContaining({ method: 'POST', keepalive: true }),
    )
  })
})
