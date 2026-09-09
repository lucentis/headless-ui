import { onMounted, onUnmounted, computed, type MaybeRef } from 'vue'
import { useMenuContext } from './MenuContext'
import { composeHandlers } from '../../utils/eventHandler'
import { useDisabled } from '../../utils/useDisabled'
import type { MenuApi, MenuItemBindings } from './types'

export interface UseMenuItemProps {
    value: string
    onClick?: (event?) => void
    disabled?: MaybeRef<boolean>
}

export function useMenuItem(props: UseMenuItemProps, menu?: MenuApi) {
    const menuApi = menu ?? useMenuContext()

    const itemId = `${menuApi.state.contentId}-item-${props.value}`
    const isDisabled = useDisabled(props.disabled)

    onMounted(() => menuApi.registerItem(props.value))
    onUnmounted(() => menuApi.unregisterItem(props.value))

    const menuItemBindings = computed(() => ({
        id: itemId,
        role: 'menuitem' as const,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-highlighted': menuApi.actions.isHighlighted(props.value) ? ('' as const) : undefined,
        onClick: composeHandlers(
            props.onClick,
            () => { if (!isDisabled.value) menuApi.actions.close() }
        ),
        onMouseenter: () => {
            if (!isDisabled.value) menuApi.actions.highlight(props.value)
        },
    }))

    const bindings: MenuItemBindings = {
        get root() { return menuItemBindings.value },
    }

    return { bindings }
}