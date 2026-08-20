import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { honorsLabel, levelLabel } from '@/utils/vocabularies'

const VOCABULARIES = resolve(__dirname, '../../folvyn-portfolio-ms/src/common/dto/vocabularies.ts')
const available = existsSync(VOCABULARIES)

function listedIn(name: string): string[] {
  const text = readFileSync(VOCABULARIES, 'utf8')
  const start = text.indexOf(`export const ${name} = [`)
  if (start === -1) return []

  const open = text.indexOf('[', start)
  const close = text.indexOf(']', open)
  return [...text.slice(open + 1, close).matchAll(/'([^']+)'/g)].map((entry) => entry[1])
}

describe.skipIf(!available)('vocabularies mirror the portfolio-ms enums', () => {
  it('renders a label for every honours grade the API accepts, in both languages', () => {
    for (const value of listedIn('HONORS')) {
      for (const lang of ['en', 'fr']) {
        expect(honorsLabel(value, lang), `${lang}: ${value} is raw`).not.toBe(value)
      }
    }
  })

  it('renders a label for every language level the API accepts, in both languages', () => {
    for (const value of listedIn('LANGUAGE_LEVELS')) {
      for (const lang of ['en', 'fr']) {
        expect(levelLabel(value, lang), `${lang}: ${value} is raw`).not.toBe(value)
      }
    }
  })

  it('says the same thing differently in each language', () => {
    expect(honorsLabel('very-good', 'fr')).not.toBe(honorsLabel('very-good', 'en'))
    expect(levelLabel('a1', 'fr')).not.toBe(levelLabel('a1', 'en'))
  })

  it('reads nothing back for a value the API would reject', () => {
    expect(honorsLabel('mention-tres-bien', 'en')).toBe('mention-tres-bien')
    expect(levelLabel(null, 'en')).toBe('')
  })
})
