import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseAccordionProps {
    /** `'single'` keeps one item open and uses a string value, `'multiple'` uses an array. Defaults to `'single'`. A value of the wrong shape logs a dev warning. */
    type?: MaybeRef<'single' | 'multiple'>
    /** Initial value when uncontrolled. */
    defaultValue?: string | string[]
    /** Controlled value. When provided, also provide `onValueChange`, otherwise changes are ignored (a dev warning is logged). */
    value?: MaybeRef<string | string[]>
    /** Called when the value should change. */
    onValueChange?: (value: string | string[]) => void
    /** A disabled accordion blocks `expand`, `collapse` and `toggle`, and disables every item. */
    disabled?: MaybeRef<boolean>
}

export interface AccordionState {
    value: string | string[]
    isDisabled: boolean
    type: 'single' | 'multiple'
}

/** `expand`, `collapse` and `toggle` do nothing and log a dev warning when the accordion is disabled. */
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
    /** Identifies the item in the accordion value. */
    value: string
    /** A disabled item blocks its own `expand`, `collapse` and `toggle`. The accordion's `disabled` also applies. */
    disabled?: MaybeRef<boolean>
}

export interface AccordionItemState {
    isExpanded: boolean
    isDisabled: boolean
}

/** Do nothing and log a dev warning when the item or its accordion is disabled. */
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

export interface AccordionItemApi extends ComponentApi<
    AccordionItemState,
    AccordionItemActions,
    AccordionItemBindings
> {}
