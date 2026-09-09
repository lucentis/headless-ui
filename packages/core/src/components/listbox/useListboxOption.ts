import { computed, onMounted, onUnmounted, toValue } from 'vue'
import { useListboxContext } from './ListboxContext'
import { composeHandlers } from '../../utils/eventHandler'
import { useDisabled } from '../../utils/useDisabled'
import type { UseListboxOptionProps, ListboxOptionApi, ListboxApi } from './types'

export function useListboxOption(props: UseListboxOptionProps, listbox?: ListboxApi): ListboxOptionApi {
    const listboxApi = listbox ?? useListboxContext()
    const disabled = useDisabled(props.disabled)
    const isDisabled = computed(() =>
        listboxApi.state.isDisabled || (disabled.value ?? false)
    )
    const isSelected = computed(() => listboxApi.actions.isSelected(props.value))
    const isHighlighted = computed(() => listboxApi.actions.isHighlighted(props.value))

    const optionId = `${listboxApi.state.listboxId}-option-${props.value}`

    // register on mount, unregister on unmount — maintains DOM order in registry
    onMounted(() => listboxApi.registerOption(props.value))
    onUnmounted(() => listboxApi.unregisterOption(props.value))

    const state: ListboxOptionApi['state'] = {
        get isSelected() { return isSelected.value },
        get isHighlighted() { return isHighlighted.value },
        get isDisabled() { return isDisabled.value },
        get optionId() { return optionId },
    }

    const optionBindings = computed(() => ({
        id: optionId,
        role: 'option' as const,
        'aria-selected': isSelected.value,
        'aria-disabled': isDisabled.value,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-highlighted': isHighlighted.value ? ('' as const) : undefined,
        'data-selected': isSelected.value ? ('' as const) : undefined,
        onMousedown: (event: MouseEvent) => event.preventDefault(),
        onClick: composeHandlers(
            props.onClick,
            () => {
                if (!isDisabled.value) {
                    listboxApi.rootRef.value?.focus()
                    listboxApi.actions.toggle(props.value)
                }
            }
        ),
        onMouseenter: () => {
            if (!isDisabled.value) listboxApi.actions.highlight(props.value)
        },
    }))

    const bindings: ListboxOptionApi['bindings'] = {
        get root() { return optionBindings.value },
    }
    
    return { state, actions: {}, bindings }
}