const CODE = /^[a-z]{2}$/

const FILES = import.meta.glob('/node_modules/country-flag-icons/3x2/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const BY_CODE = new Map(
  Object.entries(FILES)
    .map(([path, url]): [string, string] => [
      (path.split('/').pop() ?? '').replace('.svg', '').toLowerCase(),
      url,
    ])
    .filter(([code]) => CODE.test(code)),
)

export const FLAG_CODES = [...BY_CODE.keys()].sort()

export function flagUrl(code: string | null | undefined): string | undefined {
  if (!code || !CODE.test(code.toLowerCase())) return undefined
  return BY_CODE.get(code.toLowerCase())
}
