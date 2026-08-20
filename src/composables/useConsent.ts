import { ref, computed } from 'vue'

export type ConsentMode = 'measurement' | 'enhanced'
export type ConsentChoice = 'accepted' | 'refused' | null

export const CONSENT_KEY = 'portfolio_consent'
export const VISITOR_KEY = 'portfolio_visitor'
export const VISITOR_TTL_DAYS = 395

interface StoredVisitor {
  id: string
  until: number
}

const choice = ref<ConsentChoice>(null)
const mode = ref<ConsentMode>('measurement')

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    void 0
  }
}

function drop(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    void 0
  }
}

export function readChoice(): ConsentChoice {
  const stored = read(CONSENT_KEY)
  return stored === 'accepted' || stored === 'refused' ? stored : null
}

export function visitorId(): string | null {
  if (choice.value !== 'accepted') return null

  const stored = read(VISITOR_KEY)

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as StoredVisitor
      if (parsed.until > Date.now() && typeof parsed.id === 'string') return parsed.id
    } catch {
      void 0
    }
  }

  const created: StoredVisitor = {
    id: crypto.randomUUID().replace(/-/g, ''),
    until: Date.now() + VISITOR_TTL_DAYS * 86_400_000,
  }

  write(VISITOR_KEY, JSON.stringify(created))
  return created.id
}

export function accept(): void {
  choice.value = 'accepted'
  write(CONSENT_KEY, 'accepted')
}

export function refuse(): void {
  choice.value = 'refused'
  write(CONSENT_KEY, 'refused')
  drop(VISITOR_KEY)
}

export function withdraw(): void {
  choice.value = null
  drop(CONSENT_KEY)
  drop(VISITOR_KEY)
}

export function initConsent(portfolioMode: ConsentMode): void {
  mode.value = portfolioMode
  choice.value = portfolioMode === 'enhanced' ? readChoice() : 'refused'
}

export function useConsent() {
  return {
    mode: computed(() => mode.value),
    choice: computed(() => choice.value),
    needsBanner: computed(() => mode.value === 'enhanced' && choice.value === null),
    accepted: computed(() => choice.value === 'accepted'),
    accept,
    refuse,
    withdraw,
  }
}
