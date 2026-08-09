import { describe, expect, it } from 'vitest'
import { PORTFOLIO_PREFIX, portfolioPath, slugFromPath } from '@/utils/slug'

describe('slug resolution', () => {
  it('reads the slug from under the portfolio prefix', () => {
    expect(slugFromPath('/fol/jane-doe')).toBe('jane-doe')
    expect(slugFromPath('/fol/jane-doe/')).toBe('jane-doe')
  })

  it('ignores a bare slug at the root, which is now the console', () => {
    expect(slugFromPath('/jane-doe')).toBeNull()
    expect(slugFromPath('/insights')).toBeNull()
    expect(slugFromPath('/')).toBeNull()
  })

  it('refuses another first segment', () => {
    expect(slugFromPath('/api/jane-doe')).toBeNull()
    expect(slugFromPath('/app/jane-doe')).toBeNull()
  })

  it('needs a slug after the prefix', () => {
    expect(slugFromPath('/fol')).toBeNull()
    expect(slugFromPath('/fol/')).toBeNull()
  })

  it('lowercases and decodes what it finds', () => {
    expect(slugFromPath('/fol/Jane-Doe')).toBe('jane-doe')
    expect(slugFromPath('/fol/jane%2Ddoe')).toBe('jane-doe')
  })

  it('enforces the slug shape', () => {
    expect(slugFromPath('/fol/-leading')).toBeNull()
    expect(slugFromPath('/fol/double--hyphen')).toBeNull()
    expect(slugFromPath('/fol/has_underscore')).toBeNull()
    expect(slugFromPath('/fol/ab')).toBeNull()
    expect(slugFromPath(`/fol/${'a'.repeat(41)}`)).toBeNull()
  })

  it('still refuses a handful of confusing names', () => {
    expect(slugFromPath('/fol/admin')).toBeNull()
    expect(slugFromPath('/fol/api')).toBeNull()
  })

  it('refuses the prefixes the edge routes on', () => {
    expect(slugFromPath('/fol/fol')).toBeNull()
    expect(slugFromPath('/fol/app')).toBeNull()
  })

  it('builds the path it parses', () => {
    expect(portfolioPath('jane-doe')).toBe('/fol/jane-doe')
    expect(slugFromPath(portfolioPath('jane-doe'))).toBe('jane-doe')
    expect(PORTFOLIO_PREFIX).toBe('fol')
  })
})
