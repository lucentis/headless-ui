import type { MaybeRef, Ref, ComputedRef } from 'vue'
import type { ComponentApi } from '../../types'
import type { SelectInternalKey } from '../../keys/internal-keys'

export interface SelectRegistryItem {
    value: string
    id: string
    disabled: ComputedRef<boolean>
    label: string
}

export interface SelectInternals {
    registerOption: (item: SelectRegistryItem) => void
    unregisterOption: (value: string) => void
}

export interface UseSelectProps {
    /** Initial value when uncontrolled. */
    defaultValue?: string
    /** Controlled value. When provided, also provide `onValueChange`, otherwise changes are ignored (a dev warning is logged). */
    value?: MaybeRef<string>
    /** Called when the value should change. */
    onValueChange?: (value: string) => void
    /** Initial open state when uncontrolled. Defaults to `false`. */
    defaultOpen?: boolean
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
    /** A disabled select cannot be opened and blocks `select`. Closing stays possible. */
    disabled?: MaybeRef<boolean>
    /** Exposed as `state.placeholder`, to show while no option is selected. */
    placeholder?: MaybeRef<string>
}

export interface SelectState {
    value: string
    /** Label of the selected option. `null` when nothing is selected, or while the selected option is not registered (for example when it is unmounted). */
    selectedLabel: string | null
    /** Value of the highlighted option. Reset to `null` whenever the select closes. */
    highlightValue: string | null
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the content. */
    isPresent: boolean
    isDisabled: boolean
    placeholder: string | undefined
}

export interface SelectActions {
    /** Does nothing and logs a dev warning when the select is disabled. */
    open: () => void
    /** Always allowed, even when disabled. */
    close: () => void
    /** Does nothing and logs a dev warning when the select is disabled. */
    toggle: () => void
    /**
     * Selects an option and closes the select.
     * Does nothing and logs a dev warning when the select or the option is disabled, or when no option with this value is registered.
     */
    select: (value: string) => void
    /** Moves the highlight to an option. A value with no registered option is ignored. */
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
    /** Attach to the trigger element. A click on it is not an outside click, and it regains the focus after a selection. */
    triggerRef: Ref<HTMLElement | null>
    /** Attach to the content element. It receives the focus on opening. Without it, every click is treated as an outside click. */
    contentRef: Ref<HTMLElement | null>
    readonly [SelectInternalKey]: SelectInternals
}

// --- Option ---

export interface UseSelectOptionProps {
    /** Identifies the option. Must be unique, and the option must stay mounted for `select(value)` to be accepted. */
    value: string
    /** Text exposed as `selectedLabel` while this option is selected. */
    label: string
    /** A disabled option can be highlighted but not selected. The select's `disabled` also applies. */
    disabled?: MaybeRef<boolean>
    /**
     * Runs on click, even when the option is disabled, which allows logging.
     * The selection only changes for an enabled option, and `event.preventDefault()` keeps it unchanged.
     */
    onClick?: (event: MouseEvent) => void
}

export interface SelectOptionState {
    isSelected: boolean
    isHighlighted: boolean
    isDisabled: boolean
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
        onPointerenter: () => void
    }
}

export interface SelectOptionApi extends ComponentApi<SelectOptionState, SelectOptionActions, SelectOptionBindings> {}
