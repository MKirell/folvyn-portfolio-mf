import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import * as api from '@/services/portfolio.api'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.mocked(api.fetchPortfolio).mockClear()
})

describe('portfolio store request de-duplication', () => {
  it('issues one request when the same language is asked for three times at once', async () => {
    const store = usePortfolioStore()

    await Promise.all([store.load('en'), store.load('en'), store.load('en')])

    expect(api.fetchPortfolio).toHaveBeenCalledTimes(1)
  })

  it('serves a repeat call from cache rather than the network', async () => {
    const store = usePortfolioStore()

    await store.load('en')
    await store.load('en')

    expect(api.fetchPortfolio).toHaveBeenCalledTimes(1)
  })

  it('still fetches a language it has not seen', async () => {
    const store = usePortfolioStore()

    await store.load('en')
    await store.load('fr')

    expect(api.fetchPortfolio).toHaveBeenCalledTimes(2)
  })

  it('does not cache a failure, so a retry can still succeed', async () => {
    const store = usePortfolioStore()
    vi.mocked(api.fetchPortfolio).mockRejectedValueOnce(new Error('offline'))

    await store.load('en')
    expect(store.error).toBe('offline')

    await store.load('en')
    expect(api.fetchPortfolio).toHaveBeenCalledTimes(2)
    expect(store.error).toBeNull()
  })
})
