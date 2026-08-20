import type { ApiPortfolio } from '@/types/api'
import { fullName } from '@/utils/person'
import { BRAND } from '@/brand'
import { OG_HEIGHT, OG_WIDTH } from '../og'
import { palette } from './tokens'

const PAD = 72
const PHOTO = 300

export function initialsOf(portfolio: ApiPortfolio): string {
  const given = String(portfolio.person.givenName ?? '').trim()
  const family = String(portfolio.person.familyName ?? '').trim()
  const letters = `${given.charAt(0)}${family.charAt(0)}`.toUpperCase()

  return (
    letters ||
    String(portfolio.person.headline ?? '?')
      .charAt(0)
      .toUpperCase()
  )
}

function stripMarkdown(value: unknown): string {
  return String(value ?? '').replace(/\*\*(.+?)\*\*/g, '$1')
}

function node(type: string, props: Record<string, unknown>): unknown {
  return { type, props }
}

export function cardTree(portfolio: ApiPortfolio, photo: string | null): unknown {
  const c = palette()
  const name = fullName(portfolio.person)
  const headline = String(portfolio.person.headline ?? '')
  const tagline = stripMarkdown(portfolio.profile.tagline)
  const portrait = photo
    ? node('img', {
        src: photo,
        width: PHOTO,
        height: PHOTO,
        style: { borderRadius: 18, objectFit: 'cover' },
      })
    : node('div', {
        style: {
          width: PHOTO,
          height: PHOTO,
          borderRadius: 18,
          backgroundColor: c.surface,
          color: c.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 112,
          fontFamily: 'Fraunces',
        },
        children: initialsOf(portfolio),
      })

  return node('div', {
    style: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      backgroundColor: c.ground,
      color: c.ink,
      fontFamily: 'Inter',
      position: 'relative',
    },
    children: [
      node('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: 6,
          backgroundColor: c.accent,
        },
      }),
      node('div', {
        style: {
          position: 'absolute',
          bottom: 26,
          right: PAD,
          display: 'flex',
          fontFamily: 'JetBrains Mono',
          fontSize: 16,
          color: c.accent,
          letterSpacing: 3,
        },
        children: BRAND.toUpperCase(),
      }),
      node('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          padding: PAD,
        },
        children: [
          node('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              minWidth: 0,
            },
            children: [
              node('div', {
                style: {
                  fontFamily: 'Fraunces',
                  fontSize: 62,
                  lineHeight: 1.06,
                  letterSpacing: -1,
                  color: c.ink,
                },
                children: name,
              }),
              node('div', {
                style: {
                  fontFamily: 'JetBrains Mono',
                  fontSize: 25,
                  color: c.accentDeep,
                  marginTop: 24,
                },
                children: headline,
              }),
              node('div', {
                style: {
                  fontSize: 23,
                  lineHeight: 1.6,
                  color: c.soft,
                  marginTop: 22,
                  maxWidth: 620,
                },
                children: tagline,
              }),
            ],
          }),
          portrait,
        ],
      }),
    ],
  })
}
