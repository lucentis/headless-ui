import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseTooltipProps {
    delayDuration?: number
    disabled?: MaybeRef<boolean>
}

export interface TooltipState {
    isOpen: boolean
    isPresent: boolean
    isDisabled: boolean
    contentId: string
}

export interface TooltipActions {
    open: () => void
    close: () => void
}

export interface TooltipBindings {
    trigger: {
        'aria-describedby': string
        onMouseenter: () => void
        onMouseleave: () => void
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