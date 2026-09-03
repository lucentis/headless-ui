import type { MaybeRef, Ref } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseMenuProps {
    defaultOpen?: boolean
    open?: MaybeRef<boolean>
    onOpenChange?: (value: boolean) => void
}

export interface MenuState {
    isOpen: boolean
    isPresent: boolean
    activeValue: string | null
    triggerId: string
    contentId: string
}

export interface MenuActions {
    open: () => void
    close: () => void
    toggle: () => void
    activate: (value: string) => void
    activateFirst: () => void
    activateLast: () => void
    activateNext: () => void
    activatePrev: () => void
    isActive: (value: string) => boolean
}

export interface MenuItemBindings {
    id: string
    role: 'menuitem'
    'aria-disabled': true | undefined
    'data-disabled': '' | undefined
    'data-highlight': '' | undefined
    onClick: () => void
    onMouseenter: () => void
}

export interface MenuItemUserProps {
    onClick?: () => void
    disabled?: boolean
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
    getItemProps: (value: string, userProps?: MenuItemUserProps) => MenuItemBindings
}

export interface MenuApi extends ComponentApi<MenuState, MenuActions, MenuBindings> {
    triggerRef: Ref<HTMLElement | null>
    contentRef: Ref<HTMLElement | null>
    // internal — used by useMenuItem via context
    registerItem: (value: string) => void
    unregisterItem: (value: string) => void
}