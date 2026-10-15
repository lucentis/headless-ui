import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseTooltipProps {
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Initial state when uncontrolled. Defaults to `false`. */
    defaultOpen?: boolean
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
    /** Delay in milliseconds before hover or focus opens the tooltip. Defaults to `700`. */
    delayDuration?: MaybeRef<number>
    /** A disabled tooltip never opens from hover or focus, and `open` is blocked. */
    disabled?: MaybeRef<boolean>
}

export interface TooltipState {
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the content. */
    isPresent: boolean
    isDisabled: boolean
}

export interface TooltipActions {
    /** Opens immediately, without the delay. Does nothing and logs a dev warning when the tooltip is disabled. */
    open: () => void
    /** Closes immediately. Always allowed, even when disabled. */
    close: () => void
}

export interface TooltipBindings {
    trigger: {
        'data-state': 'open' | 'closed'
        'aria-describedby': string
        onPointerenter: () => void
        onPointerleave: () => void
        onFocus: () => void
        onBlur: () => void
    }
    content: {
        id: string
        role: 'tooltip'
        'data-state': 'open' | 'closed'
    }
}

export interface TooltipApi extends ComponentApi<TooltipState, TooltipActions, TooltipBindings> {}
