import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseListboxProps {
    defaultValue?: string | string[]
    value?: MaybeRef<string | string[]>
    onValueChange?: (value: string | string[]) => void
    multiple?: MaybeRef<boolean>
    disabled?: MaybeRef<boolean>
    orientation?: MaybeRef<'horizontal' | 'vertical'>
}

export interface ListboxState {
    value: string | string[]
    activeValue: string | null
    isDisabled: boolean
    multiple: boolean
    orientation: 'horizontal' | 'vertical'
    listboxId: string
}

export interface ListboxActions {
    select: (value: string) => void
    deselect: (value: string) => void
    toggle: (value: string) => void
    activate: (value: string) => void
    activateFirst: () => void
    activateLast: () => void
    activateNext: () => void
    activatePrev: () => void
    isSelected: (value: string) => boolean
    isActive: (value: string) => boolean
}

export interface ListboxOptionUserProps {
    onClick?: () => void
    disabled?: boolean
}

export interface ListboxOptionBindings {
    id: string
    role: 'option'
    'aria-selected': boolean
    'aria-disabled': true | undefined
    'data-disabled': '' | undefined
    'data-active': '' | undefined
    'data-selected': '' | undefined
    onMousedown: (event: MouseEvent) => void
    onClick: () => void
    onMouseenter: () => void
}

export interface ListboxBindings {
    root: {
        id: string
        role: 'listbox'
        'aria-multiselectable': true | undefined
        'aria-disabled': true | undefined
        'aria-activedescendant': string | undefined
        'aria-orientation': 'horizontal' | 'vertical' | undefined
        tabindex: 0
        onKeydown: (event: KeyboardEvent) => void
    }
    getOptionProps: (value: string, userProps?: ListboxOptionUserProps) => ListboxOptionBindings
}

export interface ListboxApi extends ComponentApi<ListboxState, ListboxActions, ListboxBindings> {
    rootRef: Ref<HTMLElement | null>
    registerOption: (value: string) => void
    unregisterOption: (value: string) => void
}

// --- Option ---

export interface UseListboxOptionProps {
    value: string
    disabled?: MaybeRef<boolean>
}

export interface ListboxOptionState {
    isSelected: boolean
    isActive: boolean
    isDisabled: boolean
    optionId: string
}

export type ListboxOptionActions = Record<never, never>

export interface ListboxOptionApi extends ComponentApi<ListboxOptionState, ListboxOptionActions, ListboxOptionBindings> {}