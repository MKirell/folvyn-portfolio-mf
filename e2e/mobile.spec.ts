import { expect, test } from './fixtures'

test.describe('small screens', () => {
  test('hides the links behind a burger', async ({ site }) => {
    await site.goto('/fol/mohamed-khalil-zrelly')

    await expect(site.locator('#burger')).toBeVisible()
    await expect(site.locator('#navDrawer')).toHaveClass(/-translate-x-full|translate-x-full/)
  })

  test('opens and closes the drawer', async ({ site }) => {
    await site.goto('/fol/mohamed-khalil-zrelly')

    await site.locator('#burger').click()
    await expect(site.locator('#burger')).toHaveAttribute('aria-expanded', 'true')
    await expect(site.locator('#navDrawer')).toHaveClass(/translate-x-0/)

    await site.locator('#burger').click()
    await expect(site.locator('#burger')).toHaveAttribute('aria-expanded', 'false')
  })

  test('closes the drawer after choosing a section', async ({ site }) => {
    await site.goto('/fol/mohamed-khalil-zrelly')

    await site.locator('#burger').click()
    await site
      .locator('#navLinks')
      .getByRole('link', { name: /projects/i })
      .click()

    await expect(site.locator('#burger')).toHaveAttribute('aria-expanded', 'false')
    await expect(site).toHaveURL(/#projects/)
  })

  test('keeps the navbar compact at both scroll positions', async ({ site }) => {
    await site.goto('/fol/mohamed-khalil-zrelly')
    const navbar = site.locator('#navbar')

    await expect.poll(async () => (await navbar.boundingBox())?.height).toBe(56)
    await site.mouse.wheel(0, 12)
    await expect.poll(async () => (await navbar.boundingBox())?.height).toBe(56)
  })
})
