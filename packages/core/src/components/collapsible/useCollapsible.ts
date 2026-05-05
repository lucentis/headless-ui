import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import type { UseCollapsibleProps, CollapsibleApi } from './types'

export function useCollapsible(props: UseCollapsibleProps = {}): CollapsibleApi {
    const { value: isOpen, setValue: setOpen } = useControllableState({
        value: props.open,
        defaultValue: props.defaultOpen ?? false,
        onChange: props.onOpenChange,
    })

    const isDisabled = computed(() => toValue(props.disabled) ?? false)
    const triggerId = useId('collapsible-trigger')
    const contentId = useId('collapsible-content')

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