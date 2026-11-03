import type { MaybeRef, Ref, ComputedRef } from 'vue'
import type { ComponentApi } from '../../types'
import type { MenuInternalKey } from '../../keys/internal-keys'

export interface MenuRegistryItem {
    value: string
    id: string
    disabled: ComputedRef<boolean>
    onClick?: (event: MouseEvent) => void
}

export interface MenuInternals {
    registerItem: (item: MenuRegistryItem) => void
    unregisterItem: (value: string) => void
}

export interface UseMenuProps {
    /** Initial state when uncontrolled. Defaults to `false`. */
    defaultOpen?: boolean
    /** Controlled open state. When provided, also provide `onOpenChange`, otherwise changes are ignored (a dev warning is logged). */
    open?: MaybeRef<boolean>
    /** Called when the open state should change. */
    onOpenChange?: (value: boolean) => void
}

export interface MenuState {
    isOpen: boolean
    /** Stays `true` during the exit animation (`animationDuration` in the config). Use it to render the content. */
    isPresent: boolean
    /** Value of the highlighted item. Reset to `null` whenever the menu closes. */
    highlightValue: string | null
}

export interface MenuActions {
    open: () => void
    close: () => void
    toggle: () => void
    /** Moves the highlight to an item. A value with no registered item is ignored. */
    highlight: (value: string) => void
    highlightFirst: () => void
    highlightLast: () => void
    highlightNext: () => void
    highlightPrev: () => void
    isHighlighted: (value: string) => boolean
}

export interface MenuBindings {
    trigger: {
        id: string
        'aria-haspopup': 'menu'
        'aria-expanded': boolean
        'aria-controls': string
        'data-state': 'open' | 'closed'
        onClick: () => void
    }
    content: {
        id: string
        role: 'menu'
        'aria-labelledby': string
        'aria-activedescendant': string | undefined
        'data-state': 'open' | 'closed'
        tabindex: -1
        onKeydown: (event: KeyboardEvent) => void
    }
}

export interface MenuApi extends ComponentApi<MenuState, MenuActions, MenuBindings> {
    /** Attach to the trigger element. A click on it is not an outside click. */
    triggerRef: Ref<HTMLElement | null>
    /** Attach to the content element. It receives the focus on opening. Without it, every click is treated as an outside click. */
    contentRef: Ref<HTMLElement | null>
    readonly [MenuInternalKey]: MenuInternals
}

// --- menu item ---

export interface UseMenuItemProps {
    /** Identifies the item. Must be unique within the menu. */
    value: string
    /**
     * Runs on click, even when the item is disabled, which allows logging.
     * The menu is only closed for an enabled item, and `event.preventDefault()` keeps it open.
     */
    onClick?: (event: MouseEvent) => void
    /** A disabled item cannot trigger the menu's own behavior. */
    disabled?: MaybeRef<boolean>
}

export interface MenuItemState {
    isHighlighted: boolean
    isDisabled: boolean
}

export type MenuItemActions = Record<never, never>

export interface MenuItemBindings {
    root: {
        id: string
        role: 'menuitem'
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
        'data-highlighted': '' | undefined
        onClick: (event: MouseEvent) => void
        onPointerenter: () => void
    }
}

export interface MenuItemApi extends ComponentApi<MenuItemState, MenuItemActions, MenuItemBindings> {}
