import { computed, onMounted, onUnmounted, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useListboxContext } from './ListboxContext'
import { composeHandlers } from '../../utils/eventHandler'
import type { UseListboxOptionProps, ListboxOptionApi, ListboxApi } from './types'

export function useListboxOption(props: UseListboxOptionProps, listbox?: ListboxApi): ListboxOptionApi {
    const listboxApi = listbox ?? useListboxContext()

    const isDisabled = computed(() =>
        listboxApi.state.isDisabled || (toValue(props.disabled) ?? false)
    )
    const isSelected = computed(() => listboxApi.actions.isSelected(props.value))
    const isActive = computed(() => listboxApi.actions.isActive(props.value))

    const optionId = useId('listbox-option')

    // register on mount, unregister on unmount — maintains DOM order in registry
    onMounted(() => listboxApi.registerOption(props.value))
    onUnmounted(() => listboxApi.unregisterOption(props.value))

    const state: ListboxOptionApi['state'] = {
        get isSelected() { return isSelected.value },
        get isActive() { return isActive.value },
        get isDisabled() { return isDisabled.value },
        get optionId() { return optionId },
    }

    const optionBindings = computed(() => ({
        id: optionId,
        role: 'option' as const,
        'aria-selected': isSelected.value,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-active': isActive.value ? ('' as const) : undefined,
        'data-selected': isSelected.value ? ('' as const) : undefined,
        // prevent focus from leaving the listbox root on click
        onMousedown: (event: MouseEvent) => event.preventDefault(),
        onClick: composeHandlers(
            undefined,
            () => { if (!isDisabled.value) listboxApi.actions.toggle(props.value) }
        ),
        onMouseenter: () => {
            if (!isDisabled.value) listboxApi.actions.activate(props.value)
        },
    }))

    const bindings: ListboxOptionApi['bindings'] = {
        get id() { return optionBindings.value.id },
        get role() { return optionBindings.value.role },
        get 'aria-selected'() { return optionBindings.value['aria-selected'] },
        get 'aria-disabled'() { return optionBindings.value['aria-disabled'] },
        get 'data-disabled'() { return optionBindings.value['data-disabled'] },
        get 'data-active'() { return optionBindings.value['data-active'] },
        get 'data-selected'() { return optionBindings.value['data-selected'] },
        get onMousedown() { return optionBindings.value.onMousedown },
        get onClick() { return optionBindings.value.onClick },
        get onMouseenter() { return optionBindings.value.onMouseenter },
    }

    return { state, actions: {}, bindings }
}