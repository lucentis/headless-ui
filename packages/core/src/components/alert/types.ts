import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseAlertProps {
    /** Initial state when uncontrolled. Unlike the other overlays, an alert is open by default (`true`). */
    defaultOpen?: boolean
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
    /** `'status'` is announced politely, `'alert'` assertively. Defaults to `'status'`. */
    role?: MaybeRef<'alert' | 'status'>
}

export interface AlertState {
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the element. */
    isPresent: boolean
}

export interface AlertActions {
    open: () => void
    close: () => void
}

export interface AlertBindings {
    root: {
        role: 'alert' | 'status'
        'aria-live': 'assertive' | 'polite'
        'aria-atomic': true
        'data-state': 'open' | 'closed'
    }
}

export interface AlertApi extends ComponentApi<AlertState, AlertActions, AlertBindings> {}
