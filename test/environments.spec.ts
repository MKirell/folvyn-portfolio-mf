import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const DEPLOYED = ['dev', 'prod'] as const

function read(environment: string): string {
  return readFileSync(resolve(__dirname, `../.env.${environment}`), 'utf8')
}

function keysOf(environment: string): string[] {
  return read(environment)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.split('=')[0])
    .sort()
}

describe('environment files', () => {
  it.each(DEPLOYED)('%s declares every key local does', (environment) => {
    const declared = keysOf(environment)
    const missing = keysOf('local').filter((key) => !declared.includes(key))

    expect(missing).toEqual([])
  })

  it.each(DEPLOYED)('%s never points at localhost', (environment) => {
    expect(read(environment)).not.toMatch(/localhost|127\.0\.0\.1/)
  })

  it('keeps local off the deployed hosts', () => {
    expect(read('local')).not.toMatch(/folvyn(-dev)?\.mkirell\.com/)
  })
})
