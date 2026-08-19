const COMBINING_MARKS = new RegExp('[\u0300-\u036f]', 'g')

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

export function escapeHtml(str: unknown = ''): string {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function escapeAttr(str: unknown = ''): string {
  return escapeHtml(str).replace(/"/g, '&quot;')
}

export function stripMarkdown(str: unknown = ''): string {
  return String(str).replace(/\*\*(.+?)\*\*/g, '$1')
}

export function boldify(str: unknown = ''): string {
  return escapeHtml(str).replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-ink font-semibold">$1</strong>',
  )
}

export function slugify(str: unknown = ''): string {
  return String(str)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
