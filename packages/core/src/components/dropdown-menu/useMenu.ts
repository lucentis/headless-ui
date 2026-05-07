import { computed, ref } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useConfig } from '../../config'
import { composeHandlers } from '../../utils/eventHandler'
import type { UseMenuProps, MenuApi, MenuItemUserProps } from './types'

const Keys = {
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    Home: 'Home',
    End: 'End',
    Tab: 'Tab',
} as const

export function useMenu(props: UseMenuProps = {}): MenuApi {
    const config = useConfig()

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (value) => {
            if (!value) activeValue.value = null
            props.onOpenChange?.(value)
        },
    })

    const activeValue = ref<string | null>(null)
    const registry = ref<string[]>([])

    const triggerId = useId('menu-trigger')
    const contentId = useId('menu-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    const actions: MenuApi['actions'] = {
        open,
        close,
        toggle,

        activate: (value: string) => {
            activeValue.value = value
        },

        activateFirst: () => {
            if (registry.value.length > 0) activeValue.value = registry.value[0]
        },

        activateLast: () => {
            if (registry.value.length > 0) activeValue.value = registry.value[registry.value.length - 1]
        },

        activateNext: () => {
            const items = registry.value
            if (items.length === 0) return
            if (activeValue.value === null) {
                activeValue.value = items[0]
                return
            }
            const index = items.indexOf(activeValue.value)
            const next = items[index + 1]
            if (next !== undefined) activeValue.value = next
        },

        activatePrev: () => {
            const items = registry.value
            if (items.length === 0) return
            if (activeValue.value === null) {
                activeValue.value = items[items.length - 1]
                return
            }
            const index = items.indexOf(activeValue.value)
            const prev = items[index - 1]
            if (prev !== undefined) activeValue.value = prev
        },

        isActive: (value: string) => activeValue.value === value,
    }

    useEscape({
        active: isOpen,
        onEscape: () => {
            if (config.closeOnEscape) actions.close()
        },
    })

    useOutsideClick({
        targets: [triggerRef, contentRef],
        active: isOpen,
        onOutsideClick: () => {
            if (config.closeOnOutsideClick) actions.close()
        },
    })

    const state: MenuApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
        get activeValue() { return activeValue.value },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        'aria-haspopup': 'menu' as const,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => actions.toggle(),
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'menu' as const,
        'aria-labelledby': triggerId,
        'aria-activedescendant': activeValue.value ? `${contentId}-item-${activeValue.value}` : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        tabindex: -1 as const,
        onKeydown: (event: KeyboardEvent) => {
            switch (event.key) {
                case Keys.ArrowDown:
                    event.preventDefault()
                    if (!isOpen.value) {
                        actions.open()
                        actions.activateFirst()
                    } else {
                        actions.activateNext()
                    }
                    break
                case Keys.ArrowUp:
                    event.preventDefault()
                    if (!isOpen.value) {
                        actions.open()
                        actions.activateLast()
                    } else {
                        actions.activatePrev()
                    }
                    break
                case Keys.Home:
                    event.preventDefault()
                    actions.activateFirst()
                    break
                case Keys.End:
                    event.preventDefault()
                    actions.activateLast()
                    break
                case Keys.Tab:
                    actions.close()
                    break
            }
        },
    }))

    const bindings: MenuApi['bindings'] = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
        getItemProps(value: string, userProps?: MenuItemUserProps) {
            const isDisabled = userProps?.disabled ?? false
            const isActive = actions.isActive(value)
            const itemId = `${contentId}-item-${value}`

            return {
                id: itemId,
                role: 'menuitem' as const,
                'aria-disabled': isDisabled ? (true as const) : undefined,
                'data-disabled': isDisabled ? ('' as const) : undefined,
                'data-active': isActive ? ('' as const) : undefined,
                onClick: composeHandlers(
                    isDisabled ? undefined : userProps?.onClick,
                    () => { if (!isDisabled) actions.close() }
                ),
                onMouseenter: () => {
                    if (!isDisabled) actions.activate(value)
                },
            }
        },
    }

    return {
        state,
        actions,
        bindings,
        triggerRef,
        contentRef,
        registerItem: (value: string) => {
            if (!registry.value.includes(value)) registry.value.push(value)
        },
        unregisterItem: (value: string) => {
            registry.value = registry.value.filter(v => v !== value)
        },
    }
}