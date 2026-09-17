import { computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useListboxContext } from './ListboxContext'
import { composeHandlers } from '../../utils/eventHandler'
import { useDisabled } from '../../utils/useDisabled'
import { useId } from '../../utils/useId'
import { UseListboxOptionProps, ListboxOptionApi, ListboxApi, ListboxOptionState, ListboxOptionBindings } from './types'
import { ListboxInternalKey } from '../../keys/internal-keys'

export function useListboxOption(props: UseListboxOptionProps, listbox?: ListboxApi): ListboxOptionApi {
    const listboxApi = listbox ?? useListboxContext()
    const { registerOption, unregisterOption, updateOption } = listboxApi[ListboxInternalKey]

    const ownDisabled = useDisabled(props.disabled)
    const isDisabled = computed(() => listboxApi.state.isDisabled || ownDisabled.value)
    const isSelected = computed(() => listboxApi.actions.isSelected(props.value))
    const isHighlighted = computed(() => listboxApi.actions.isHighlighted(props.value))

    const optionId = useId('listbox-option')

    onMounted(() => registerOption({ value: props.value, id: optionId, disabled: isDisabled }))
    onUnmounted(() => unregisterOption(props.value))

    const state = reactive<ListboxOptionState>({
        get isSelected() { return isSelected.value },
        get isHighlighted() { return isHighlighted.value },
        get isDisabled() { return isDisabled.value },
        get optionId() { return optionId },
    })

    const optionBindings = computed(() => ({
        id: optionId,
        role: 'option' as const,
        'aria-selected': isSelected.value,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
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

    const bindings: ListboxOptionBindings = {
        get root() { return optionBindings.value },
    }

    return { state, actions: {}, bindings }
}