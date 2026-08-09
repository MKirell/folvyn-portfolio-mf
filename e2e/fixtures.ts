import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test as base, type Page, type Route } from '@playwright/test'
import type { ApiPortfolio } from '../src/types/api'

function fixture(name: string): ApiPortfolio {
  const path = resolve(import.meta.dirname, `../test/fixtures/${name}`)
  return JSON.parse(readFileSync(path, 'utf8')) as ApiPortfolio
}

export const en = fixture('portfolio.en.json')
export const fr = fixture('portfolio.fr.json')

export interface Beacon {
  sessionId: string
  events: { type: string; target?: string }[]
}

export interface Collected {
  beacons: Beacon[]
}

async function json(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
}

export async function stubApi(page: Page, collected: Collected): Promise<void> {
  await page.route('**/api/v1/portfolio**', (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/languages')) return json(route, en.availableLangs)
    return json(route, url.searchParams.get('lang') === 'fr' ? fr : en)
  })

  await page.route('**/collect', async (route) => {
    collected.beacons.push(route.request().postDataJSON() as Beacon)
    await route.fulfill({ status: 204, body: '' })
  })
}

export const test = base.extend<{ collected: Collected; site: Page }>({
  collected: async ({}, use) => {
    await use({ beacons: [] })
  },

  site: async ({ page, collected }, use) => {
    await stubApi(page, collected)
    await use(page)
  },
})

export { expect } from '@playwright/test'
