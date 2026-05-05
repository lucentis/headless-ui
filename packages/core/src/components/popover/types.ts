import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface UsePopoverProps {
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
}

export interface PopoverState {
    isOpen: boolean
    isPresent: boolean
    triggerId: string
    contentId: string
}

export interface PopoverActions {
    open: () => void
    close: () => void
    toggle: () => void
}

export interface PopoverBindings {
    trigger: {
        id: string
        'aria-haspopup': 'dialog'
        'aria-expanded': boolean
        'aria-controls': string
        'data-state': 'open' | 'closed'
        onClick: () => void
    }
    content: {
        id: string
        role: 'dialog'
        'aria-labelledby': string
        'data-state': 'open' | 'closed'
    }
}

export interface PopoverApi extends ComponentApi<PopoverState, PopoverActions, PopoverBindings> {
    triggerRef: Ref<HTMLElement | null>
    contentRef: Ref<HTMLElement | null>
}