import { describe, it, expect, beforeEach, vi } from 'vitest'

async function loadTheme(options: { stored?: string | null; systemLight?: boolean } = {}) {
  vi.resetModules()
  localStorage.clear()
  document.documentElement.className = ''

  if (options.stored) localStorage.setItem('portfolio_theme', options.stored)

  const listeners: ((event: { matches: boolean }) => void)[] = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(() => ({
      matches: options.systemLight ?? false,
      addEventListener: (_: string, handler: (event: { matches: boolean }) => void) =>
        listeners.push(handler),
      removeEventListener: vi.fn(),
    })),
  })

  const module = await import('@/composables/useTheme')
  return { ...module.useTheme(), listeners }
}

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('restores a previously chosen theme', async () => {
    const { theme } = await loadTheme({ stored: 'light' })

    expect(theme.value).toBe('light')
  })

  it('ignores a stored value that is not a theme', async () => {
    const { theme } = await loadTheme({ stored: 'chartreuse', systemLight: true })

    expect(theme.value).toBe('light')
  })

  it('follows the system preference when nothing is stored', async () => {
    expect((await loadTheme({ systemLight: true })).theme.value).toBe('light')
    expect((await loadTheme({ systemLight: false })).theme.value).toBe('dark')
  })

  it('keeps following the system while the user has not chosen', async () => {
    const { theme, listeners } = await loadTheme({ systemLight: false })

    listeners.forEach((notify) => notify({ matches: true }))

    expect(theme.value).toBe('light')
  })

  it('stops following the system once the user picks a theme', async () => {
    const { theme, toggleTheme, listeners } = await loadTheme({ systemLight: false })

    toggleTheme()
    expect(theme.value).toBe('light')

    listeners.forEach((notify) => notify({ matches: false }))
    expect(theme.value).toBe('light')
  })

  it('toggles between the two themes', async () => {
    const { theme, toggleTheme } = await loadTheme({ stored: 'dark' })

    toggleTheme()
    expect(theme.value).toBe('light')

    toggleTheme()
    expect(theme.value).toBe('dark')
  })

  it('drives the document class so CSS can react', async () => {
    const { toggleTheme } = await loadTheme({ stored: 'dark' })

    toggleTheme()

    expect(document.documentElement.classList.contains('scheme-light')).toBe(true)
    expect(document.documentElement.classList.contains('scheme-dark')).toBe(false)
  })

  it('remembers the choice for the next visit', async () => {
    const { toggleTheme } = await loadTheme({ stored: 'dark' })

    toggleTheme()

    expect(localStorage.getItem('portfolio_theme')).toBe('light')
  })
})
