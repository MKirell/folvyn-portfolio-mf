import { expect, test } from './fixtures'
import { messagesFor } from '../src/i18n/messages'

test.describe('first paint', () => {
  test('renders the hero once the API answers', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await expect(site.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(site.locator('#navbar')).toBeVisible()
    await expect(site.locator('#main-content')).toBeVisible()
  })

  test('renders every section the navigation offers', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    for (const key of Object.keys(messagesFor('en').nav)) {
      await expect(site.locator(`#${key}`)).toHaveCount(1)
    }
  })

  test('shows a recoverable error when the API is down', async ({ page }) => {
    await page.route('**/api/v1/portfolio**', (route) => route.fulfill({ status: 500, body: '{}' }))
    await page.goto('/fol/ada-lovelace')

    await expect(page.getByText(/could not be loaded/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible()
  })
})

test.describe('navbar', () => {
  test('stays transparent at the very top of the page', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await expect(site.locator('#navbar')).toHaveClass(/before:bg-transparent/)
  })

  test('engages its background once the page has actually moved', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await site.mouse.wheel(0, 12)
    await expect(site.locator('#navbar')).toHaveClass(/before:bg-transparent/)

    await site.mouse.wheel(0, 80)
    await expect(site.locator('#navbar')).toHaveClass(/before:bg-bg\/82/)
  })

  test('shrinks to the scrolled height at the same moment', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')
    const navbar = site.locator('#navbar')

    await expect.poll(async () => (await navbar.boundingBox())?.height).toBe(72)

    await site.mouse.wheel(0, 92)
    await expect(navbar).toHaveClass(/h-16/)
    await expect.poll(async () => (await navbar.boundingBox())?.height).toBe(64)
  })

  test('marks the section under the fold as current', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await site
      .locator('#navbar')
      .getByRole('link', { name: /projects/i })
      .click()

    await expect(site.locator('#navbar a[aria-current="true"]')).toContainText(/projects/i)
    await expect(site).toHaveURL(/#projects/)
  })
})

test.describe('assets', () => {
  test('serves the flag from the assets prefix, not a bundled import', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    const style = await site
      .locator('#navbar button[data-language-switch] span[style*="url"]')
      .first()
      .getAttribute('style')

    expect(style).toMatch(/country-flag-icons\/3x2\/[A-Z]{2}\.svg/)
  })

  test('ships the platform logo with the build, not from a portfolio bucket', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    const source = await site.locator('#navbar img').first().getAttribute('src')
    expect(source).toMatch(/folvyn-logo-(dark|light)/)
  })

  test('points documents at the files prefix', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    const documents = site.locator('a[href*="/files/"]')
    await expect(documents.first()).toHaveAttribute('href', /\/files\/.+\.pdf/)
  })
})

test.describe('preferences', () => {
  test('switches theme and remembers it', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    const before = await site.locator('html').getAttribute('class')
    await site.locator('#navbar button[role="switch"]').click()
    const after = await site.locator('html').getAttribute('class')

    expect(after).not.toBe(before)

    await site.reload()
    await expect(site.locator('html')).toHaveClass(after as string)
  })

  test('switches language and reloads the content', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await site.locator('#navbar button[data-language-switch]').first().click()

    await expect(site).toHaveURL(/lang=fr/)
    await expect(site.locator('html')).toHaveAttribute('lang', 'fr')
  })
})

test.describe('terminal', () => {
  test('answers the help command', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    const input = site.locator('#hero-shell-input')
    await input.click()
    await input.fill('help')
    await input.press('Enter')

    await expect(
      site.getByText(messagesFor('en').shell.helpItems[0].cmd, { exact: false }).first(),
    ).toBeVisible()
  })

  test('reports an unknown command instead of failing silently', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    const input = site.locator('#hero-shell-input')
    await input.click()
    await input.fill('nonsense')
    await input.press('Enter')

    await expect(site.getByText(/nonsense/).first()).toBeVisible()
  })
})

test.describe('analytics', () => {
  test('sends nothing when the build has the collector disabled', async ({ site, collected }) => {
    await site.goto('/fol/ada-lovelace')
    await site.mouse.wheel(0, 2000)
    await site.waitForTimeout(500)

    expect(collected.beacons).toHaveLength(0)
  })
})

test.describe('accessibility', () => {
  test('offers a skip link before anything else', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await site.keyboard.press('Tab')
    await expect(site.getByRole('link', { name: /skip to main content/i })).toBeFocused()
  })

  test('labels the navigation landmark', async ({ site }) => {
    await site.goto('/fol/ada-lovelace')

    await expect(site.getByRole('navigation', { name: /main navigation/i })).toBeVisible()
  })
})
