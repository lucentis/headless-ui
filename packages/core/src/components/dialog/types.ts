import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseDialogProps {
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
    modal?: MaybeRef<boolean>
}

export interface DialogState {
    isOpen: boolean
    isPresent: boolean
    isModal: boolean
    titleId: string
    descriptionId: string
}

export interface DialogActions {
    open: () => void
    close: () => void
}

export interface DialogBindings {
    overlay: {
        'aria-hidden': true
        'data-state': 'open' | 'closed'
        onClick: () => void
    }
    content: {
        role: 'dialog'
        'aria-modal': true | undefined
        'aria-labelledby': string
        'aria-describedby': string
        'data-state': 'open' | 'closed'
        onKeydown: (event: KeyboardEvent) => void
    }
    title: {
        id: string
    }
    description: {
        id: string
    }
}

export interface DialogApi extends ComponentApi<DialogState, DialogActions, DialogBindings> {
    contentRef: Ref<HTMLElement | null>
}