import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface UsePopoverProps {
    /** Initial state when uncontrolled. Defaults to `false`. */
    defaultOpen?: boolean
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
}

export interface PopoverState {
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the content. */
    isPresent: boolean
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
    /** Attach to the trigger element. A click on it is not an outside click. */
    triggerRef: Ref<HTMLElement | null>
    /** Attach to the content element. Without it, every click is treated as an outside click and closes the popover. */
    contentRef: Ref<HTMLElement | null>
}
