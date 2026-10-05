import type { MaybeRef, Ref, ComputedRef } from 'vue'
import type { ComponentApi, AriaOrientation } from '../../types'
import type { TabsInternalKey } from '../../keys/internal-keys'

export interface TabsRegistryItem {
    value: string
    triggerId: string
    panelId: string
    disabled: ComputedRef<boolean>
    triggerRef: Ref<HTMLElement | null>
}

export interface TabsInternals {
    linkTrigger: (item: TabsRegistryItem) => void
    unlinkTrigger: (value: string) => void
    getTriggerId: (value: string) => string
    getPanelId: (value: string) => string
}

export interface UseTabsProps {
    defaultValue?: string
    value?: MaybeRef<string>
    onValueChange?: (value: string) => void
    orientation?: MaybeRef<AriaOrientation>
    activation?: MaybeRef<'automatic' | 'manual'>
    disabled?: MaybeRef<boolean>
}

export interface TabsState {
    value: string
    highlightValue: string | null
    orientation: AriaOrientation
    activation: 'automatic' | 'manual'
    isDisabled: boolean
}

export interface TabsActions {
    select: (value: string) => void
    isSelected: (value: string) => boolean
    highlight: (value: string) => void
    highlightFirst: () => void
    highlightLast: () => void
    highlightNext: () => void
    highlightPrev: () => void
    isHighlighted: (value: string) => boolean
}

export interface TabsBindings {
    list: {
        id: string
        role: 'tablist'
        'aria-orientation': AriaOrientation
        onKeydown: (event: KeyboardEvent) => void
    }
}

export interface TabsApi extends ComponentApi<TabsState, TabsActions, TabsBindings> {
    readonly [TabsInternalKey]: TabsInternals
}

// --- Trigger ---

export interface UseTabsTriggerProps {
    value: string
    disabled?: MaybeRef<boolean>
}

export interface TabsTriggerState {
    isSelected: boolean
    isHighlighted: boolean
    isDisabled: boolean
}

export interface TabsTriggerActions {
    select: () => void
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
        'data-orientation': AriaOrientation
        'data-highlighted': '' | undefined
        tabindex: 0 | -1
        onClick: () => void
    }
}

export interface TabsTriggerApi extends ComponentApi<TabsTriggerState, TabsTriggerActions, TabsTriggerBindings> {
    triggerRef: Ref<HTMLElement | null>
}

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
        'data-orientation': AriaOrientation
        tabindex: 0
    }
}

export interface TabsPanelApi extends ComponentApi<TabsPanelState, TabsPanelActions, TabsPanelBindings> {}
