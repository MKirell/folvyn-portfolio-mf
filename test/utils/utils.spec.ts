import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { boldify } from '@/utils/text'
import { renderedSections } from '@/utils/sections'
import type { ApiPortfolio } from '@/types/api'
import { flagUrl } from '@/utils/flags'
import { docUrl, imgUrl, setAssetPrefix } from '@/utils/docs'
import {
  LANDING_GAP,
  isPlainClick,
  navHeight,
  onSectionLink,
  scrollToSection,
  sectionScrollTop,
} from '@/utils/scroll'

describe('boldify', () => {
  it('turns a **marked** run into a styled strong element', () => {
    expect(boldify('a **bold** word')).toBe(
      'a <strong class="text-ink font-semibold">bold</strong> word',
    )
  })

  it('converts every occurrence, not just the first', () => {
    const result = boldify('**one** and **two**')

    expect(result.match(/<strong/g)).toHaveLength(2)
  })

  it('is non-greedy so adjacent runs stay separate', () => {
    expect(boldify('**a** x **b**')).toContain('>a</strong> x <strong')
  })

  it('escapes HTML in owner-authored text, so a portfolio cannot inject a script', () => {
    const injected = boldify('<img src=x onerror="alert(1)">')

    expect(injected).not.toContain('<img')
    expect(injected).not.toMatch(/<[a-z]/i)
    expect(injected).toContain('&lt;img')
  })

  it('escapes a closing tag that would break out of the element', () => {
    expect(boldify('</strong><script>steal()</script>')).not.toContain('<script')
  })

  it('escapes quotes and ampersands rather than emitting them raw', () => {
    const result = boldify(`a & b " c ' d`)

    expect(result).toContain('&amp;')
    expect(result).toContain('&quot;')
    expect(result).toContain('&#39;')
  })

  it('still emits the strong element it is meant to, and only that', () => {
    const result = boldify('**<b>x</b>**')

    expect(result).toBe('<strong class="text-ink font-semibold">&lt;b&gt;x&lt;/b&gt;</strong>')
  })

  it('leaves text without markers untouched', () => {
    expect(boldify('plain text')).toBe('plain text')
  })

  it('ignores an unclosed marker', () => {
    expect(boldify('**unclosed')).toBe('**unclosed')
  })

  it('ignores empty markers', () => {
    expect(boldify('****')).toBe('****')
  })

  it('returns an empty string for null, undefined and empty input', () => {
    expect(boldify(null)).toBe('')
    expect(boldify(undefined)).toBe('')
    expect(boldify('')).toBe('')
  })
})

describe('flagUrl', () => {
  it.each(['gb', 'fr', 'tn', 'nl', 'pr'])('resolves the %s flag from the bundled set', (code) => {
    expect(flagUrl(code)).toBeTruthy()
  })

  it('gives every country its own flag', () => {
    const seen = new Set(['gb', 'fr', 'tn', 'nl', 'pr'].map((code) => flagUrl(code)))
    expect(seen.size).toBe(5)
  })

  it('resolves any ISO code, so a new locale needs no upload', () => {
    expect(flagUrl('de')).toBeTruthy()
    expect(flagUrl('jp')).toBeTruthy()
  })

  it('accepts an uppercase code the same way', () => {
    expect(flagUrl('GB')).toBe(flagUrl('gb'))
  })

  it('returns undefined for anything that is not a two-letter code', () => {
    expect(flagUrl('deu')).toBeUndefined()
    expect(flagUrl('')).toBeUndefined()
    expect(flagUrl(null)).toBeUndefined()
    expect(flagUrl(undefined)).toBeUndefined()
  })
})

describe('docUrl and imgUrl', () => {
  it('builds a document path with the fit-vertical viewer hint', () => {
    expect(docUrl('resume.pdf')).toContain('files/resume.pdf#view=FitV')
  })

  it('builds an image path', () => {
    expect(imgUrl('photo.jpg')).toContain('imgs/photo.jpg')
  })

  it('returns undefined for a missing filename', () => {
    expect(docUrl(null)).toBeUndefined()
    expect(docUrl(undefined)).toBeUndefined()
    expect(docUrl('')).toBeUndefined()
    expect(imgUrl(null)).toBeUndefined()
    expect(imgUrl('')).toBeUndefined()
  })

  it('serves flat paths when the API reports no owner prefix', () => {
    setAssetPrefix('')
    expect(imgUrl('off-image.jpeg')).toBe('/imgs/off-image.jpeg')
    expect(docUrl('resume.pdf')).toBe('/files/resume.pdf#view=FitV')
  })

  it('places the owner segment inside the folder CloudFront routes', () => {
    setAssetPrefix('6a75c3457e6aac5c2955d5ca')
    expect(imgUrl('off-image.jpeg')).toBe('/imgs/6a75c3457e6aac5c2955d5ca/off-image.jpeg')
    expect(docUrl('resume.pdf')).toBe('/files/6a75c3457e6aac5c2955d5ca/resume.pdf#view=FitV')
    setAssetPrefix('')
  })

  it('keeps a nested stored key nested under the owner', () => {
    setAssetPrefix('6a75c3457e6aac5c2955d5ca')
    expect(imgUrl('award-awa-2023-1.jpg')).toBe(
      '/imgs/6a75c3457e6aac5c2955d5ca/award-awa-2023-1.jpg',
    )
    setAssetPrefix('')
  })
})

describe('scroll helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.scrollY = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('navHeight', () => {
    it('reads the live navbar height', () => {
      const nav = document.createElement('div')
      nav.id = 'navbar'
      Object.defineProperty(nav, 'offsetHeight', { value: 90, configurable: true })
      document.body.appendChild(nav)

      expect(navHeight()).toBe(90)
    })

    it('falls back to 64 when there is no navbar', () => {
      expect(navHeight()).toBe(64)
    })
  })

  describe('sectionScrollTop', () => {
    function buildSection(styles: Partial<CSSStyleDeclaration>, rect: Partial<DOMRect>) {
      const el = document.createElement('section')
      document.body.appendChild(el)

      vi.spyOn(window, 'getComputedStyle').mockReturnValue(styles as CSSStyleDeclaration)
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        height: 100,
        ...rect,
      } as DOMRect)

      return el
    }

    it('subtracts the declared scroll margin', () => {
      const el = buildSection({ scrollMarginTop: '20px', paddingTop: '0px' }, { top: 200 })
      window.scrollY = 100

      expect(sectionScrollTop(el)).toBe(280)
    })

    it('falls back to the navbar height when no scroll margin is set', () => {
      const el = buildSection({ scrollMarginTop: '', paddingTop: '0px' }, { top: 200 })

      expect(sectionScrollTop(el)).toBe(136)
    })

    it('lands past the padding when the section is taller than the viewport', () => {
      window.innerHeight = 500
      const el = buildSection(
        { scrollMarginTop: '20px', paddingTop: '100px' },
        { top: 200, height: 900 },
      )

      expect(sectionScrollTop(el)).toBe(180 + (100 - LANDING_GAP))
    })

    it('never returns a negative offset', () => {
      const el = buildSection({ scrollMarginTop: '500px', paddingTop: '0px' }, { top: 0 })

      expect(sectionScrollTop(el)).toBe(0)
    })
  })

  describe('scrollToSection', () => {
    it('scrolls and records the hash when the section exists', () => {
      const el = document.createElement('section')
      el.id = 'projects'
      document.body.appendChild(el)
      const replaceState = vi.spyOn(history, 'replaceState')

      expect(scrollToSection('projects')).toBe(true)
      expect(window.scrollTo).toHaveBeenCalled()
      expect(replaceState).toHaveBeenCalledWith(null, '', '#projects')
    })

    it('reports failure and does nothing when the section is missing', () => {
      const replaceState = vi.spyOn(history, 'replaceState')

      expect(scrollToSection('nowhere')).toBe(false)
      expect(replaceState).not.toHaveBeenCalled()
    })
  })

  describe('isPlainClick', () => {
    it('accepts a plain left click', () => {
      expect(isPlainClick(new MouseEvent('click', { button: 0 }))).toBe(true)
    })

    it.each([
      ['middle click', { button: 1 }],
      ['ctrl click', { ctrlKey: true }],
      ['meta click', { metaKey: true }],
      ['shift click', { shiftKey: true }],
      ['alt click', { altKey: true }],
    ])('rejects a %s so the browser can open a new tab', (_label, init) => {
      expect(isPlainClick(new MouseEvent('click', init))).toBe(false)
    })

    it('rejects an already-handled event', () => {
      const event = new MouseEvent('click', { cancelable: true })
      event.preventDefault()

      expect(isPlainClick(event)).toBe(false)
    })
  })

  describe('onSectionLink', () => {
    it('takes over navigation for an existing section', () => {
      const el = document.createElement('section')
      el.id = 'about'
      document.body.appendChild(el)
      const event = new MouseEvent('click', { button: 0, cancelable: true })

      onSectionLink(event, '#about')

      expect(event.defaultPrevented).toBe(true)
    })

    it('leaves the browser to follow a link to a section that is not on the page', () => {
      const event = new MouseEvent('click', { button: 0, cancelable: true })

      onSectionLink(event, '#missing')

      expect(event.defaultPrevented).toBe(false)
    })

    it('ignores a click with no target', () => {
      const event = new MouseEvent('click', { button: 0, cancelable: true })

      onSectionLink(event, null)
      onSectionLink(event, undefined)

      expect(event.defaultPrevented).toBe(false)
    })

    it('lets a modified click through untouched', () => {
      const el = document.createElement('section')
      el.id = 'about'
      document.body.appendChild(el)
      const event = new MouseEvent('click', { button: 0, ctrlKey: true, cancelable: true })

      onSectionLink(event, '#about')

      expect(event.defaultPrevented).toBe(false)
    })
  })
})

describe('renderedSections', () => {
  function portfolio(overrides: Record<string, unknown> = {}) {
    return {
      experiences: [],
      projects: [],
      skillCategories: [],
      education: { degrees: [], certifications: [], spokenLanguages: [] },
      achievements: { volunteering: [], awards: [] },
      ...overrides,
    } as unknown as ApiPortfolio
  }

  it('renders nothing before the portfolio has loaded', () => {
    expect(renderedSections(null)).toEqual([])
  })

  it('keeps hero, about and contact even when the owner has filled in nothing else', () => {
    expect(renderedSections(portfolio()).map((entry) => entry.key)).toEqual([
      'hero',
      'about',
      'contact',
    ])
  })

  it('leaves out a section whose collection is empty', () => {
    const keys = renderedSections(portfolio({ projects: [{ title: 'One' }] })).map(
      (entry) => entry.key,
    )

    expect(keys).toContain('projects')
    expect(keys).not.toContain('experience')
    expect(keys).not.toContain('skills')
  })

  it('shows education for a degree or a certification', () => {
    const withDegree = portfolio({
      education: { degrees: [{ title: 'MSc' }], certifications: [], spokenLanguages: [] },
    })
    const withCertification = portfolio({
      education: { degrees: [], certifications: [{ title: 'Cloud' }], spokenLanguages: [] },
    })

    expect(renderedSections(withDegree).map((entry) => entry.key)).toContain('education')
    expect(renderedSections(withCertification).map((entry) => entry.key)).toContain('education')
  })

  it('leaves education out when only spoken languages are filled in, since About renders those', () => {
    const withLanguages = portfolio({
      education: { degrees: [], certifications: [], spokenLanguages: [{ name: 'English' }] },
    })

    expect(renderedSections(withLanguages).map((entry) => entry.key)).not.toContain('education')
  })

  it('gives hero and about the same background, then alternates from there', () => {
    const all = renderedSections(
      portfolio({
        experiences: [{ company: 'One' }],
        projects: [{ title: 'One' }],
        skillCategories: [{ title: 'One' }],
      }),
    )

    expect(all).toEqual([
      { key: 'hero', tinted: false },
      { key: 'about', tinted: false },
      { key: 'experience', tinted: true },
      { key: 'projects', tinted: false },
      { key: 'skills', tinted: true },
      { key: 'contact', tinted: false },
    ])
  })

  it('alternates over what is rendered, not over the full section list', () => {
    const sparse = renderedSections(portfolio({ skillCategories: [{ title: 'One' }] }))

    expect(sparse).toEqual([
      { key: 'hero', tinted: false },
      { key: 'about', tinted: false },
      { key: 'skills', tinted: true },
      { key: 'contact', tinted: false },
    ])
  })
})
