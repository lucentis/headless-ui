import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useId } from '../../utils/useId'
import { useSelectContext } from './SelectContext'
import { composeHandlers } from '../../utils/eventHandler'
import { useDisabled } from '../../utils/useDisabled'
import type { UseSelectOptionProps, SelectOptionApi, SelectApi } from './types'
import { SelectInternalKey } from '../../keys/internal-keys'

export function useSelectOption(props: UseSelectOptionProps, select?: SelectApi): SelectOptionApi {
    const selectApi = select ?? useSelectContext()
    const { registerOption, unregisterOption, updateOption } = selectApi[SelectInternalKey]

    const ownDisabled = useDisabled(props.disabled)
    const isDisabled = computed(() => selectApi.state.isDisabled || ownDisabled.value)
    const isSelected = computed(() => selectApi.actions.isSelected(props.value))
    const isHighlighted = computed(() => selectApi.actions.isHighlighted(props.value))

    const optionId = useId('select-option')

    onMounted(() => registerOption({ value: props.value, id: optionId, disabled: isDisabled, label: props.label }))
    onUnmounted(() => unregisterOption(props.value))

    const state: SelectOptionApi['state'] = reactive({
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
                    selectApi.triggerRef.value?.focus()
                    selectApi.actions.select(props.value)
                }
            }
        ),
        onMouseenter: () => {
            if (!isDisabled.value) selectApi.actions.highlight(props.value)
        },
    }))

    const bindings: SelectOptionApi['bindings'] = {
        get root() { return optionBindings.value },
    }

    return { state, actions: {}, bindings }
}