import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import type { UseCollapsibleProps, CollapsibleApi } from './types'

export function useCollapsible(props: UseCollapsibleProps = {}): CollapsibleApi {
    const isControlled = props.open !== undefined
    const internalOpen = ref(props.defaultOpen ?? false)

    const isOpen = computed(() => isControlled ? toValue(props.open) as boolean : internalOpen.value)
    const isDisabled = computed(() => toValue(props.disabled) ?? false)

    const triggerId = useId('collapsible-trigger')
    const contentId = useId('collapsible-content')

    function setOpen(value: boolean): void {
        if (!isControlled) internalOpen.value = value
        props.onOpenChange?.(value)
    }

    const state: CollapsibleApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isOpen.value },
        get isDisabled() { return isDisabled.value },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    }

    const actions: CollapsibleApi['actions'] = {
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!isOpen.value),
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => {
            if (!isDisabled.value) actions.toggle()
        },
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'region' as const,
        'aria-labelledby': triggerId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: CollapsibleApi['bindings'] = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    return { state, actions, bindings }
}