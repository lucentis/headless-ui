import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface MenuRegistryItem {
    value: string
    id: string
    disabled: boolean
}

export interface UseMenuProps {
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
}

export interface MenuState {
    isOpen: boolean
    isPresent: boolean
    highlightValue: string | null
    triggerId: string
    contentId: string
}

export interface MenuActions {
    open: () => void
    close: () => void
    toggle: () => void
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

export interface UseMenuItemProps {
    value: string
    onClick?: (event: MouseEvent) => void
    disabled?: MaybeRef<boolean>
}

export interface MenuItemBindings {
    root: {
        id: string
        role: 'menuitem'
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
        'data-highlighted': '' | undefined
        onClick: (event: MouseEvent) => void
        onMouseenter: (event: MouseEvent) => void
    }
}

export interface MenuApi extends ComponentApi<MenuState, MenuActions, MenuBindings> {
    triggerRef: Ref<HTMLElement | null>
    contentRef: Ref<HTMLElement | null>
    registerItem: (item: MenuRegistryItem) => void
    unregisterItem: (value: string) => void
    updateItem: (value: string, patch: Partial<Omit<MenuRegistryItem, 'value'>>) => void
}