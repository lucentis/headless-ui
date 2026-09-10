import { computed, onMounted, onUnmounted, toValue } from 'vue'
import { useSelectContext } from './SelectContext'
import { useDisabled } from '../../utils/useDisabled'
import { composeHandlers } from '../../utils/eventHandler'
import type { UseSelectOptionProps, SelectOptionApi, SelectApi } from './types'

export function useSelectOption(props: UseSelectOptionProps, select?: SelectApi): SelectOptionApi {
    const selectApi = select ?? useSelectContext()
    const disabled = useDisabled(props.disabled)
    const isDisabled = computed(() =>
        selectApi.state.isDisabled || (disabled.value ?? false)
    )
    const isSelected = computed(() => selectApi.actions.isSelected(props.value))
    const isHighlighted = computed(() => selectApi.actions.isHighlighted(props.value))

    // id derived from contentId + value — matches aria-activedescendant format
    const optionId = `${selectApi.state.contentId}-option-${props.value}`

    onMounted(() => selectApi.registerOption(props.value, props.label))
    onUnmounted(() => selectApi.unregisterOption(props.value))

    const state: SelectOptionApi['state'] = {
        get isSelected() { return isSelected.value },
        get isHighlighted() { return isHighlighted.value },
        get isDisabled() { return isDisabled.value },
        get optionId() { return optionId },
    }

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
        get root() { return optionBindings.value}
    }

    return { state, actions: {}, bindings }
}