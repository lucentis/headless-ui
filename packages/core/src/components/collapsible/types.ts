import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseCollapsibleProps {
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
    disabled?: MaybeRef<boolean>
}

export interface CollapsibleState {
    isOpen: boolean
    isPresent: boolean
    isDisabled: boolean
    triggerId: string
    contentId: string
}

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
        onClick: (event: MouseEvent) => void
    }
    content: {
        id: string
        role: 'region'
        'aria-labelledby': string
        'data-state': 'open' | 'closed'
    }
}

export interface CollapsibleApi extends ComponentApi<CollapsibleState, CollapsibleActions, CollapsibleBindings> {}