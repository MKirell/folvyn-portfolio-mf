const ASSETS_BASE_URL = (import.meta.env.VITE_ASSETS_BASE_URL ?? '').replace(/\/+$/, '')

let ownerPrefix = ''

export function setAssetPrefix(prefix: string): void {
  ownerPrefix = prefix.replace(/^\/+|\/+$/g, '')
}

function assetPath(folder: string, filename: string): string {
  const owner = ownerPrefix ? `${ownerPrefix}/` : ''
  return `${ASSETS_BASE_URL}/${folder}/${owner}${filename}`
}

export function docUrl(filename: string | null | undefined): string | undefined {
  return filename ? `${assetPath('files', filename)}#view=FitV` : undefined
}

export function imgUrl(filename: string | null | undefined): string | undefined {
  return filename ? assetPath('imgs', filename) : undefined
}
