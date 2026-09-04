import { computed, ref, watch, nextTick } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useConfig } from '../../config'
import type { UseMenuProps, MenuApi } from './types'

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
            if (!value) highlightValue.value = null
            props.onOpenChange?.(value)
        },
    })

    
        
        
    const highlightValue = ref<string | null>(null)
    const registry = ref<string[]>([])

    const triggerId = useId('menu-trigger')
    const contentId = useId('menu-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    /// try to focus the content of menu when open for arrow navigation
    
    watch(isOpen, async (newOpen) => {
        if (!newOpen) return
    
        await nextTick()
    
        contentRef.value?.focus()
    })

    const actions: MenuApi['actions'] = {
        open,
        close,
        toggle,

        highlight: (value: string) => {
            highlightValue.value = value
        },

        highlightFirst: () => {
            if (registry.value.length > 0) highlightValue.value = registry.value[0]
        },

        highlightLast: () => {
            if (registry.value.length > 0) highlightValue.value = registry.value[registry.value.length - 1]
        },

        highlightNext: () => {
            const items = registry.value
            if (items.length === 0) return
            if (highlightValue.value === null) {
                highlightValue.value = items[0]
                return
            }
            const index = items.indexOf(highlightValue.value)
            const next = items[index + 1]
            if (next !== undefined) highlightValue.value = next
        },

        highlightPrev: () => {
            const items = registry.value
            if (items.length === 0) return
            if (highlightValue.value === null) {
                highlightValue.value = items[items.length - 1]
                return
            }
            const index = items.indexOf(highlightValue.value)
            const prev = items[index - 1]
            if (prev !== undefined) highlightValue.value = prev
        },

        isHighlighted: (value: string) => highlightValue.value === value,
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
        'aria-activedescendant': highlightValue.value ? `${contentId}-item-${highlightValue.value}` : undefined,
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
        registerItem: (value: string) => {
            if (!registry.value.includes(value)) registry.value.push(value)
        },
        unregisterItem: (value: string) => {
            registry.value = registry.value.filter(v => v !== value)
        },
    }
}