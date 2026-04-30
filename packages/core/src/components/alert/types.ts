import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseAlertProps {
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
    role?: MaybeRef<'alert' | 'status'>
}

export interface AlertState {
    isOpen: boolean
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