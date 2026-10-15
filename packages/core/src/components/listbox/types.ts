import type { MaybeRef, Ref, ComputedRef } from 'vue'
import type { ComponentApi, AriaOrientation } from '../../types'
import type { ListboxInternalKey } from '../../keys/internal-keys'

export interface ListboxRegistryItem {
    value: string
    id: string
    disabled: ComputedRef<boolean>
}

export interface ListboxInternals {
    registerOption: (item: ListboxRegistryItem) => void
    unregisterOption: (value: string) => void
}

export interface UseListboxProps {
    /** Initial value when uncontrolled: a string, or an array when `multiple`. A value of the wrong shape logs a dev warning. */
    defaultValue?: string | string[]
    /** Controlled value. When provided, also provide `onValueChange`, otherwise changes are ignored (a dev warning is logged). */
    value?: MaybeRef<string | string[]>
    /** Called when the value should change. */
    onValueChange?: (value: string | string[]) => void
    /** Allows several selected options and makes the value an array. Defaults to `false`. */
    multiple?: MaybeRef<boolean>
    /** A disabled listbox blocks `select`, `deselect` and `toggle`, and disables every option. */
    disabled?: MaybeRef<boolean>
    /** Sets the arrow keys used to move the highlight. Defaults to `'vertical'`. */
    orientation?: MaybeRef<AriaOrientation>
}

export interface ListboxState {
    value: string | string[]
    /** Value of the highlighted option. A disabled option can be highlighted but not activated. */
    highlightValue: string | null
    isDisabled: boolean
    multiple: boolean
    orientation: AriaOrientation
}

export interface ListboxActions {
    /** Does nothing and logs a dev warning when the listbox or the option is disabled, or when no option with this value is registered. */
    select: (value: string) => void
    /** Does nothing and logs a dev warning when the listbox or the option is disabled. An unregistered value is accepted, so a stale selection can be removed. */
    deselect: (value: string) => void
    /** Selects or deselects. Same rules as `select`, reported under its own name. */
    toggle: (value: string) => void
    /** Moves the highlight to an option. A value with no registered option is ignored. */
    highlight: (value: string) => void
    highlightFirst: () => void
    highlightLast: () => void
    highlightNext: () => void
    highlightPrev: () => void
    isSelected: (value: string) => boolean
    isHighlighted: (value: string) => boolean
}

export interface ListboxBindings {
    root: {
        id: string
        role: 'listbox'
        'aria-multiselectable': true | undefined
        'aria-disabled': true | undefined
        'aria-activedescendant': string | undefined
        'aria-orientation': 'horizontal' | undefined
        'data-orientation': AriaOrientation
        'data-disabled': '' | undefined
        tabindex: 0
        onKeydown: (event: KeyboardEvent) => void
    }
}

export interface ListboxApi extends ComponentApi<ListboxState, ListboxActions, ListboxBindings> {
    /** Attach to the listbox element. Clicking an option moves the focus back to it. */
    rootRef: Ref<HTMLElement | null>
    readonly [ListboxInternalKey]: ListboxInternals
}

// --- Option ---

export interface UseListboxOptionProps {
    /** Identifies the option. Must be unique, and the option must stay mounted for `select(value)` to be accepted. */
    value: string
    /** A disabled option can be highlighted but not selected. The listbox's `disabled` also applies. */
    disabled?: MaybeRef<boolean>
    /**
     * Runs on click, even when the option is disabled, which allows logging.
     * The selection only changes for an enabled option, and `event.preventDefault()` keeps it unchanged.
     */
    onClick?: (event: MouseEvent) => void
}

export interface ListboxOptionState {
    isSelected: boolean
    isHighlighted: boolean
    isDisabled: boolean
}

export type ListboxOptionActions = Record<never, never>

export interface ListboxOptionBindings {
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

export interface ListboxOptionApi extends ComponentApi<
    ListboxOptionState,
    ListboxOptionActions,
    ListboxOptionBindings
> {}
