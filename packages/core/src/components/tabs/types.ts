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
    /** Initial selected tab when uncontrolled. */
    defaultValue?: string
    /** Controlled selected tab. When provided, also provide `onValueChange`, otherwise changes are ignored (a dev warning is logged). */
    value?: MaybeRef<string>
    /** Called when the selected tab should change. */
    onValueChange?: (value: string) => void
    /** Sets the arrow keys used to move between tabs. Defaults to `'horizontal'`. */
    orientation?: MaybeRef<AriaOrientation>
    /** `'automatic'` selects a tab as soon as it is highlighted. `'manual'` only moves the focus, and the tab is selected when its trigger is activated. Defaults to `'automatic'`. */
    activation?: MaybeRef<'automatic' | 'manual'>
    /** A disabled tabs blocks `select` and disables every trigger. */
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
    /** Selects a tab. Does nothing and logs a dev warning when the tabs or the tab is disabled, or when no tab with this value is registered. */
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
        'data-orientation': AriaOrientation
        onKeydown: (event: KeyboardEvent) => void
    }
}

export interface TabsApi extends ComponentApi<TabsState, TabsActions, TabsBindings> {
    readonly [TabsInternalKey]: TabsInternals
}

// --- Trigger ---

export interface UseTabsTriggerProps {
    /** Identifies the tab. Must be unique, and match the `value` of its panel. */
    value: string
    /** A disabled trigger cannot be selected. The tabs' `disabled` also applies. */
    disabled?: MaybeRef<boolean>
}

export interface TabsTriggerState {
    isSelected: boolean
    isHighlighted: boolean
    isDisabled: boolean
}

export interface TabsTriggerActions {
    /** Selects this tab. Does nothing and logs a dev warning when the trigger or its tabs is disabled. */
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
    /** Attach to the trigger element so arrow-key navigation can move the focus to it. */
    triggerRef: Ref<HTMLElement | null>
}

// --- Panel ---

export interface UseTabsPanelProps {
    /** The `value` of the tab this panel belongs to. */
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
