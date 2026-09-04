import { onMounted, onUnmounted } from 'vue'
import { useMenuContext } from './MenuContext'
import { composeHandlers } from '../../utils/eventHandler'
import type { MenuApi } from './types'

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

    const bindings = {
        get id() { return itemId },
        get role() { return 'menuitem' as const },
        get 'aria-disabled'() { return props.disabled ? (true as const) : undefined },
        get 'data-disabled'() { return props.disabled ? ('' as const) : undefined },
        get 'data-highlighted'() { return menuApi.actions.isHighlight(props.value) ? ('' as const) : undefined },
        onClick: composeHandlers(
            props.disabled ? undefined : props.onClick,
            () => { if (!props.disabled) menuApi.actions.close() }
        ),
        onMouseenter: () => {
            if (!props.disabled) menuApi.actions.highlighted(props.value)
        },
    }

    return { bindings }
}