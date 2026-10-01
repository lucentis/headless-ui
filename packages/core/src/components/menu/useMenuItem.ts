import { computed, onMounted, onUnmounted } from 'vue'
import { useId } from '../../utils/useId'
import { useMenuContext } from './MenuContext'
import { composeHandlers } from '../../utils/eventHandler'
import { useDisabled } from '../../utils/useDisabled'
import type { MenuApi, MenuItemBindings, UseMenuItemProps } from './types'
import { MenuInternalKey } from '../../keys/internal-keys'

export function useMenuItem(props: UseMenuItemProps, menu?: MenuApi) {
    const menuApi = menu ?? useMenuContext()
    const { registerItem, unregisterItem } = menuApi[MenuInternalKey]
    const isDisabled = useDisabled(props.disabled)

    const itemId = useId('menu-item')


    const onClick = composeHandlers(
        props.onClick,
        () => {
            if (!isDisabled.value) {
                menuApi.actions.close()
            }
        }
    )

    onMounted(() => registerItem({ value: props.value, id: itemId, disabled: isDisabled, onClick }))
    onUnmounted(() => unregisterItem(props.value))

    const menuItemBindings = computed(() => ({
        id: itemId,
        role: 'menuitem' as const,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-highlighted': menuApi.actions.isHighlighted(props.value) ? ('' as const) : undefined,
        onClick,
        onMouseenter: () => {
            menuApi.actions.highlight(props.value)
        },
    }))

    const bindings: MenuItemBindings = {
        get root() { return menuItemBindings.value },
    }

    return { bindings }
}