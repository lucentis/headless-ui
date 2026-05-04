import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseTabsProps {
    defaultValue?: string
    value?: MaybeRef<string>
    onValueChange?: (value: string) => void
    orientation?: MaybeRef<'horizontal' | 'vertical'>
    activation?: MaybeRef<'automatic' | 'manual'>
    disabled?: MaybeRef<boolean>
}

export interface TabsState {
    value: string
    focusedValue: string
    orientation: 'horizontal' | 'vertical'
    activation: 'automatic' | 'manual'
    isDisabled: boolean
    listId: string
}

export interface TabsActions {
    select: (value: string) => void
    focus: (value: string) => void
    isSelected: (value: string) => boolean
    isFocused: (value: string) => boolean
}

export type TabsBindings = Record<never, never>

export interface TabsApi extends ComponentApi<TabsState, TabsActions, TabsBindings> {}

// --- Trigger ---

export interface UseTabsTriggerProps {
    value: string
    disabled?: MaybeRef<boolean>
}

export interface TabsTriggerState {
    isSelected: boolean
    isFocused: boolean
    isDisabled: boolean
}

export interface TabsTriggerActions {
    select: () => void
    focus: () => void
}

export interface TabsTriggerBindings {
    trigger: {
        id: string
        role: 'tab'
        'aria-selected': boolean
        'aria-controls': string
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
        'data-state': 'active' | 'inactive'
        'data-orientation': 'horizontal' | 'vertical'
        tabindex: 0 | -1
        onClick: () => void
        onFocus: () => void
        onKeydown: (event: KeyboardEvent) => void
    }
}

export interface TabsTriggerApi extends ComponentApi<TabsTriggerState, TabsTriggerActions, TabsTriggerBindings> {}

// --- Panel ---

export interface UseTabsPanelProps {
    value: string
}

export interface TabsPanelState {
    isSelected: boolean
}

export type TabsPanelActions = Record<never, never>

export interface TabsPanelBindings {
    panel: {
        id: string
        role: 'tabpanel'
        'aria-labelledby': string
        'data-state': 'active' | 'inactive'
        'data-orientation': 'horizontal' | 'vertical'
        tabindex: 0
    }
}

export interface TabsPanelApi extends ComponentApi<TabsPanelState, TabsPanelActions, TabsPanelBindings> {}