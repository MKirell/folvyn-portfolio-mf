import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface Palette {
  ground: string
  tint: string
  surface: string
  ink: string
  soft: string
  accent: string
  accentDeep: string
}

function stylesheet(): string {
  const candidates = [
    resolve(__dirname, 'style.css'),
    resolve(__dirname, '..', '..', 'src', 'style.css'),
  ]
  const found = candidates.find((path) => existsSync(path))

  if (!found) throw new Error('the card cannot find style.css to take its palette from')
  return readFileSync(found, 'utf8')
}

function token(css: string, name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8})`))

  if (!match) throw new Error(`style.css declares no --color-${name}`)
  return match[1]
}

export function palette(): Palette {
  const css = stylesheet()

  return {
    ground: token(css, 'bg-dark'),
    tint: token(css, 'bg-tint-dark'),
    surface: token(css, 'surface-2-dark'),
    ink: token(css, 'ink-dark'),
    soft: token(css, 'ink-soft-dark'),
    accent: token(css, 'accent-dark'),
    accentDeep: token(css, 'accent-deep-dark'),
  }
}
