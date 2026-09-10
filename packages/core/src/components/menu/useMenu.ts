import { computed, ref, watch } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { Keys } from '../../utils/keys'
import { useConfig } from '../../config'
import type { UseMenuProps, MenuApi, MenuRegistryItem } from './types'

export function useMenu(props: UseMenuProps = {}): MenuApi {
    const config = useConfig()

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (value) => {
            if (!value) clearHighlight()
            props.onOpenChange?.(value)
        },
    })

    watch(isOpen, (newOpen) => {
        if (!newOpen) return
        contentRef.value?.focus()
    }, { flush: 'post' })

    const { registry, register, unregister, updateItem, getItem } = useRegistry<MenuRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted, clearHighlight } = useHighlight(registry)

    const triggerId = useId('menu-trigger')
    const contentId = useId('menu-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    const actions: MenuApi['actions'] = {
        open,
        close,
        toggle,
        highlight,
        highlightFirst,
        highlightLast,
        highlightNext,
        highlightPrev,
        isHighlighted,
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
        get highlightValue() { return highlightValue.value },
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
        'aria-activedescendant': highlightValue.value
            ? getItem(highlightValue.value)?.id
            : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        tabindex: -1 as const,
        onKeydown: (event: KeyboardEvent) => {
            switch (event.key) {
                case Keys.ArrowDown:
                    event.preventDefault()
                    if (!isOpen.value) {
                        actions.open()
                        actions.highlightFirst()
                    } else {
                        actions.highlightNext()
                    }
                    break
                case Keys.ArrowUp:
                    event.preventDefault()
                    if (!isOpen.value) {
                        actions.open()
                        actions.highlightLast()
                    } else {
                        actions.highlightPrev()
                    }
                    break
                case Keys.Home:
                    event.preventDefault()
                    actions.highlightFirst()
                    break
                case Keys.End:
                    event.preventDefault()
                    actions.highlightLast()
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
    }

    return {
        state,
        actions,
        bindings,
        triggerRef,
        contentRef,
        registerItem: register,
        unregisterItem: unregister,
        updateItem,
    }
}