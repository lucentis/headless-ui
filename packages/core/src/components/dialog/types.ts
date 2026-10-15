import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseDialogProps {
    /** Initial state when uncontrolled. Defaults to `false`. */
    defaultOpen?: boolean
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
    /** A modal dialog locks the page scroll, traps the focus and sets `aria-modal`. Defaults to `true`. */
    modal?: MaybeRef<boolean>
}

export interface DialogState {
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the dialog. */
    isPresent: boolean
    isModal: boolean
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
        id: string
        role: 'dialog'
        'aria-modal': true | undefined
        'aria-labelledby': string
        'aria-describedby': string
        'data-state': 'open' | 'closed'
    }
    /** Spread on the element that names the dialog. Without it, the dialog has no accessible name and a dev warning is logged (an `aria-label` on the content also works). */
    title: {
        id: string
    }
    /** Spread on the element that describes the dialog. Optional. */
    description: {
        id: string
    }
}

export interface DialogApi extends ComponentApi<DialogState, DialogActions, DialogBindings> {
    /** Attach to the dialog content element. Required for the focus trap and initial focus. */
    contentRef: Ref<HTMLElement | null>
}
