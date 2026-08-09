import { en, expect, test } from './fixtures'

test.describe('preview bridge', () => {
  test('renders the section a payload asks for', async ({ site }) => {
    await site.goto('/preview.html')

    await expect(site.getByText('Waiting for the editor')).toBeVisible()

    await site.evaluate((payload) => {
      window.postMessage({ type: 'folvyn:preview', section: 'project', payload }, '*')
    }, en)

    await expect(site.getByText(en.projects[0].title)).toBeVisible()
  })

  test('reports its height back to the embedder', async ({ site }) => {
    await site.goto('/preview.html')

    const height = await site.evaluate(async (payload) => {
      return await new Promise<number>((resolve) => {
        window.addEventListener('message', (event) => {
          const data = event.data as { type?: string; height?: number }
          if (data?.type === 'folvyn:preview:rendered') resolve(data.height ?? 0)
        })
        window.postMessage({ type: 'folvyn:preview', section: 'certification', payload }, '*')
      })
    }, en)

    expect(height).toBeGreaterThan(0)
  })
})

test('renders the desktop layout above the widest breakpoint', async ({ site }) => {
  await site.setViewportSize({ width: 1512, height: 900 })
  await site.goto('/preview.html')

  await site.evaluate((payload) => {
    window.postMessage({ type: 'folvyn:preview', section: 'spokenLanguage', payload }, '*')
  }, en)

  const columns = await site
    .locator('section#about div.grid')
    .first()
    .evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)

  expect(columns).toBe(2)
})
