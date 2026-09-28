import { computed, ref, reactive, watch } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import { useDismiss } from '../../utils/useDismiss'
import { useConfig } from '../../config'
import type { UseMenuProps, MenuApi, MenuRegistryItem, MenuInternals, MenuState, MenuActions, MenuBindings } from './types'
import { MenuInternalKey } from '../../keys/internal-keys'

export function useMenu(props: UseMenuProps = {}): MenuApi {
    const config = useConfig()

    const triggerId = useId('menu-trigger')
    const contentId = useId('menu-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    
    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (value) => {
            if (!value) clearHighlight()
            props.onOpenChange?.(value)
        },
        animationDuration: config.animationDuration
    })

    useDismiss({
        active: isOpen,
        targets: [triggerRef, contentRef],
        onDismiss: close,
        escape: config.closeOnEscape,
        outsideClick: config.closeOnOutsideClick,
    })

    watch(isOpen, (newOpen) => {
        if (!newOpen) return
        contentRef.value?.focus()
    }, { flush: 'post' })

    const { registry, register, unregister, updateItem, getItem } = useRegistry<MenuRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted, clearHighlight } = useHighlight(registry)

    const state = reactive<MenuState>({
        isOpen,
        isPresent,
        highlightValue,
    })

    const actions: MenuActions = {
        open, close, toggle,
        highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted,
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        'aria-haspopup': 'menu' as const,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => actions.toggle(),
    }))

    const { onKeydown: onArrowKeydown } = useArrowNavigation({
        onNext: actions.highlightNext,
        onPrev: actions.highlightPrev,
        onFirst: actions.highlightFirst,
        onLast: actions.highlightLast,
    })

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
            if (event.key === 'Tab') { actions.close(); return }
            onArrowKeydown(event)
        },
    }))

    const bindings: MenuBindings = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    const internals: MenuInternals = {
        registerItem: register,
        unregisterItem: unregister,
        updateItem,
    }

    return {
        state,
        actions,
        bindings,
        triggerRef,
        contentRef,
        [MenuInternalKey]: internals,
    }
}