import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseCollapsibleProps {
    /** Initial state when uncontrolled. Defaults to `false`. */
    defaultOpen?: boolean
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
    /** A disabled collapsible blocks `open`, `close` and `toggle`. Calling them directly logs a dev warning. */
    disabled?: MaybeRef<boolean>
}

export interface CollapsibleState {
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the content. */
    isPresent: boolean
    isDisabled: boolean
}

/** Blocked when the collapsible is disabled: the call does nothing and logs a dev warning. */
export interface CollapsibleActions {
    open: () => void
    close: () => void
    toggle: () => void
}

export interface CollapsibleBindings {
    trigger: {
        id: string
        'aria-expanded': boolean
        'aria-controls': string
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
        'data-state': 'open' | 'closed'
        onClick: () => void
    }
    content: {
        id: string
        role: 'region'
        'aria-labelledby': string
        'data-state': 'open' | 'closed'
    }
}

export interface CollapsibleApi extends ComponentApi<CollapsibleState, CollapsibleActions, CollapsibleBindings> {}
