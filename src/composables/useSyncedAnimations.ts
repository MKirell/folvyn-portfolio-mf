import { onBeforeUnmount, onMounted } from 'vue'

const SELECTOR = '.animate-icon-hint'

function align(element: Element): void {
  if (typeof element.getAnimations !== 'function') return

  for (const animation of element.getAnimations()) {
    if (animation.playState === 'idle' || animation.playState === 'finished') continue
    try {
      animation.startTime = 0
    } catch {
      continue
    }
  }
}

export function syncIconHints(root: ParentNode = document): void {
  for (const element of root.querySelectorAll(SELECTOR)) align(element)
}

export function useSyncedAnimations(): void {
  let frame = 0

  function schedule(): void {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      syncIconHints()
    })
  }

  function onAnimationStart(event: AnimationEvent): void {
    const target = event.target
    if (target instanceof Element && target.matches(SELECTOR)) align(target)
  }

  onMounted(() => {
    if (typeof document.querySelectorAll !== 'function') return

    schedule()
    void document.fonts?.ready.then(schedule)
    document.addEventListener('animationstart', onAnimationStart, true)
  })

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame)
    document.removeEventListener('animationstart', onAnimationStart, true)
  })
}
