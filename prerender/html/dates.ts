const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

export function parseMonthYearRange(period = ''): { startDate?: string; endDate?: string } {
  const m = period.match(/(\d{2})\/(\d{4})\s*—\s*(?:(\d{2})\/(\d{4})|Present)/)
  if (!m) return {}
  const [, sm, sy, em, ey] = m
  return em && ey
    ? { startDate: `${sy}-${sm}`, endDate: `${ey}-${em}` }
    : { startDate: `${sy}-${sm}` }
}

export function parseYearRange(years = ''): { startDate?: string; endDate?: string } {
  const m = years.match(/(\d{4})(?:\s*—\s*(\d{4}))?/)
  if (!m) return {}
  return { startDate: m[1], endDate: m[2] || m[1] }
}

export function parseCertDate(dateStr = ''): string | undefined {
  const m = dateStr.match(/([A-Za-z]{3})\w*\s+(\d{4})/)
  if (!m) return undefined
  const month = MONTHS[m[1].toLowerCase()]
  return month ? `${m[2]}-${String(month).padStart(2, '0')}` : m[2]
}

export function parseProjectDate(period = ''): string | undefined {
  const mmYear = period.match(/^(\d{2})\/(\d{4})/)
  if (mmYear) return `${mmYear[2]}-${mmYear[1]}`
  const yearOnly = period.match(/(\d{4})/)
  return yearOnly ? yearOnly[1] : undefined
}

export function span(
  startDate: string,
  endDate: string | null,
): { startDate: string; endDate?: string } {
  return endDate ? { startDate, endDate } : { startDate }
}
