import { computed, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import type { UseCollapsibleProps, CollapsibleApi } from './types'

export function useCollapsible(props: UseCollapsibleProps = {}): CollapsibleApi {
    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
    })

    const isDisabled = computed(() => toValue(props.disabled) ?? false)

    const triggerId = useId('collapsible-trigger')
    const contentId = useId('collapsible-content')

    const state: CollapsibleApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
        get isDisabled() { return isDisabled.value },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    }

    const actions: CollapsibleApi['actions'] = { open, close, toggle }

    const triggerBindings = computed(() => ({
        id: triggerId,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => {
            if (!isDisabled.value) toggle()
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