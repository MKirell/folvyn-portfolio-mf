const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ESCAPES[character])
}

export function boldify(text: string | null | undefined): string {
  if (!text) return ''
  return escapeHtml(text).replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-ink font-semibold">$1</strong>',
  )
}
