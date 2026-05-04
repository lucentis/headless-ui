import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseAccordionProps {
    type?: 'single' | 'multiple'
    defaultValue?: string | string[]
    value?: MaybeRef<string | string[]>
    onValueChange?: (value: string | string[]) => void
    disabled?: MaybeRef<boolean>
}

export interface AccordionState {
    value: string | string[]
    isDisabled: boolean
    type: 'single' | 'multiple'
}

export interface AccordionActions {
    expand: (itemValue: string) => void
    collapse: (itemValue: string) => void
    toggle: (itemValue: string) => void
    isExpanded: (itemValue: string) => boolean
}

export type AccordionBindings = Record<never, never>

export interface AccordionApi extends ComponentApi<AccordionState, AccordionActions, AccordionBindings> {}

// --- Item ---

export interface UseAccordionItemProps {
    value: string
    disabled?: MaybeRef<boolean>
}

export interface AccordionItemState {
    isExpanded: boolean
    isDisabled: boolean
    triggerId: string
    contentId: string
}

export interface AccordionItemActions {
    expand: () => void
    collapse: () => void
    toggle: () => void
}

export interface AccordionItemBindings {
    trigger: {
        id: string
        role: 'button'
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

export interface AccordionItemApi extends ComponentApi<AccordionItemState, AccordionItemActions, AccordionItemBindings> {}