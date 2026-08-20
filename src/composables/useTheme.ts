import { ref, type Ref } from 'vue'
import { track } from '@/composables/useAnalytics'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'portfolio_theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const stored = getStoredTheme()
let followSystem = stored === null

const theme = ref<Theme>(stored ?? getSystemTheme())

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!followSystem) return
    theme.value = e.matches ? 'dark' : 'light'
  })
}

function setTheme(value: Theme): void {
  followSystem = false
  theme.value = value
  track('theme', { target: value })
  document.documentElement.classList.remove('scheme-light-dark', 'scheme-light', 'scheme-dark')
  document.documentElement.classList.add(`scheme-${value}`)
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    void 0
  }
}

function toggleTheme(): void {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

export interface UseTheme {
  theme: Ref<Theme>
  toggleTheme: () => void
}

export function useTheme(): UseTheme {
  return { theme, toggleTheme }
}
