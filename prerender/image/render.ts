import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import satori from 'satori'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import type { ApiPortfolio } from '@/types/api'
import { OG_HEIGHT, OG_SCALE, OG_WIDTH } from '../og'
import { cardTree } from './card'

let wasmReady: Promise<void> | null = null

function asset(name: string): Buffer {
  const candidates = [
    resolve(__dirname, name),
    resolve(__dirname, '..', '..', 'dist-prerender', name),
  ]
  return readFileSync(candidates.find(existsSync) ?? candidates[0])
}

function font(name: string): Buffer {
  return asset(`fonts/${name}`)
}

async function ready(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(asset('resvg.wasm') as unknown as BufferSource)
  }
  return wasmReady
}

export async function fetchPhoto(url: string, timeoutMs = 4000): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) return null

    const type = response.headers.get('content-type') ?? 'image/jpeg'
    if (!type.startsWith('image/') || type.includes('svg')) return null

    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
  } catch {
    return null
  }
}

export async function renderCard(portfolio: ApiPortfolio, photo: string | null): Promise<Buffer> {
  const svg = await satori(cardTree(portfolio, photo) as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Inter', data: font('Inter-Regular.ttf'), weight: 400, style: 'normal' },
      { name: 'Fraunces', data: font('Fraunces-SemiBold.ttf'), weight: 600, style: 'normal' },
      {
        name: 'JetBrains Mono',
        data: font('JetBrainsMono-Regular.ttf'),
        weight: 400,
        style: 'normal',
      },
    ],
  })

  await ready()

  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH * OG_SCALE } }).render().asPng(),
  )
}
