import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

export interface PagedList<T> {
  page: Ref<number>
  pageCount: ComputedRef<number>
  items: ComputedRef<T[]>
  hasPages: ComputedRef<boolean>
  isFirst: ComputedRef<boolean>
  isLast: ComputedRef<boolean>
  go: (index: number) => void
  next: () => void
  previous: () => void
}

export function usePagedList<T>(
  source: ComputedRef<T[]> | Ref<T[]>,
  perPage: number,
  resetOn?: Ref<unknown> | ComputedRef<unknown>,
): PagedList<T> {
  const page = ref(0)

  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / perPage)))
  const hasPages = computed(() => pageCount.value > 1)

  const items = computed(() => {
    const start = page.value * perPage
    return source.value.slice(start, start + perPage)
  })

  const isFirst = computed(() => page.value === 0)
  const isLast = computed(() => page.value >= pageCount.value - 1)

  function go(index: number): void {
    page.value = Math.min(Math.max(index, 0), pageCount.value - 1)
  }

  function next(): void {
    if (!isLast.value) page.value += 1
  }

  function previous(): void {
    if (!isFirst.value) page.value -= 1
  }

  watch(pageCount, (count) => {
    if (page.value > count - 1) page.value = count - 1
  })

  if (resetOn) watch(resetOn, () => (page.value = 0))

  return { page, pageCount, items, hasPages, isFirst, isLast, go, next, previous }
}
