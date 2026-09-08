import { onMounted, onUnmounted, computed } from 'vue'
import { useMenuContext } from './MenuContext'
import { composeHandlers } from '../../utils/eventHandler'
import type { MenuApi, MenuItemBindings } from './types'

export interface UseMenuItemProps {
    value: string
    onClick?: () => void
    disabled?: boolean
}

export function useMenuItem(props: UseMenuItemProps, menu?: MenuApi) {
    const menuApi = menu ?? useMenuContext()

    const itemId = `${menuApi.state.contentId}-item-${props.value}`

    onMounted(() => menuApi.registerItem(props.value))
    onUnmounted(() => menuApi.unregisterItem(props.value))

    const menuItemBindings = computed(() => ({
        id: itemId,
        role: 'menuitem' as const,
        'aria-disabled': props.disabled,
        'data-disabled': props.disabled ? ('' as const) : undefined,
        'data-highlighted': menuApi.actions.isHighlighted(props.value) ? ('' as const) : undefined,
        onClick: composeHandlers(
            props.disabled ? undefined : props.onClick,
            () => { if (!props.disabled) menuApi.actions.close() }
        ),
        onMouseenter: () => {
            if (!props.disabled) menuApi.actions.highlight(props.value)
        },
    }))

    const bindings: MenuItemBindings['bindings'] = {
        get root() { return menuItemBindings.value },
    }

    return { bindings }
}