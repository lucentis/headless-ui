import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface SelectRegistryItem {
    value: string
    id: string
    disabled: boolean
    label: string
}

export interface UseSelectProps {
    defaultValue?: string
    value?: MaybeRef<string>
    onValueChange?: (value: string) => void
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
    disabled?: MaybeRef<boolean>
    placeholder?: string
}

export interface SelectState {
    value: string
    selectedLabel: string | null
    highlightValue: string | null
    isOpen: boolean
    isPresent: boolean
    isDisabled: boolean
    placeholder: string | undefined
    triggerId: string
    contentId: string
}

export interface SelectActions {
    open: () => void
    close: () => void
    toggle: () => void
    select: (value: string) => void
    highlight: (value: string) => void
    highlightFirst: () => void
    highlightLast: () => void
    highlightNext: () => void
    highlightPrev: () => void
    isSelected: (value: string) => boolean
    isHighlighted: (value: string) => boolean
}

export interface SelectBindings {
    trigger: {
        id: string
        role: 'combobox'
        'aria-haspopup': 'listbox'
        'aria-expanded': boolean
        'aria-controls': string
        'aria-disabled': true | undefined
        disabled: true | undefined
        'data-disabled': '' | undefined
        'data-state': 'open' | 'closed'
        onClick: () => void
    }
    content: {
        id: string
        role: 'listbox'
        'aria-labelledby': string
        'aria-activedescendant': string | undefined
        'data-state': 'open' | 'closed'
        tabindex: -1
        onKeydown: (event: KeyboardEvent) => void
    }
}

export interface SelectApi extends ComponentApi<SelectState, SelectActions, SelectBindings> {
    triggerRef: Ref<HTMLElement | null>
    contentRef: Ref<HTMLElement | null>
    registerOption: (item: SelectRegistryItem) => void
    unregisterOption: (value: string) => void
    updateOption: (value: string, patch: Partial<Omit<SelectRegistryItem, 'value'>>) => void
    getOption: (value: string) => SelectRegistryItem | undefined
}

// --- Option ---

export interface UseSelectOptionProps {
    value: string
    label: string
    disabled?: MaybeRef<boolean>
    onClick?: (event: MouseEvent) => void
}

export interface SelectOptionState {
    isSelected: boolean
    isHighlighted: boolean
    isDisabled: boolean
    optionId: string
}

export type SelectOptionActions = Record<never, never>

export interface SelectOptionBindings {
    root: {
        id: string
        role: 'option'
        'aria-selected': boolean
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
        'data-highlighted': '' | undefined
        'data-selected': '' | undefined
        onMousedown: (event: MouseEvent) => void
        onClick: (event: MouseEvent) => void
        onMouseenter: (event: MouseEvent) => void
    }
}

export interface SelectOptionApi extends ComponentApi<SelectOptionState, SelectOptionActions, SelectOptionBindings> {}