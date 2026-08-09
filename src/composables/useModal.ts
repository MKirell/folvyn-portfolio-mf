import { reactive } from 'vue'
import type { ApiProject } from '@/types/api'

export interface ModalState {
  open: boolean
  project: ApiProject | null
  index: number
}

const modal = reactive<ModalState>({ open: false, project: null, index: -1 })

function openModal(project: ApiProject, index: number): void {
  modal.open = true
  modal.project = project
  modal.index = index
}

function closeModal(): void {
  modal.open = false
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (modal.open && e.key === 'Escape') closeModal()
})

export interface UseModal {
  modal: ModalState
  openModal: (project: ApiProject, index: number) => void
  closeModal: () => void
}

export function useModal(): UseModal {
  return { modal, openModal, closeModal }
}
