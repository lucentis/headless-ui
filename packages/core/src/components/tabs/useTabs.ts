import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import type { UseTabsProps, TabsApi } from './types'

export function useTabs(props: UseTabsProps = {}): TabsApi {
    const { value, setValue } = useControllableState({
        value: props.value,
        defaultValue: props.defaultValue ?? '',
        onChange: props.onValueChange,
    })

    const focusedValue = ref('')
    const orientation = computed(() => toValue(props.orientation) ?? 'horizontal')
    const activation = computed(() => toValue(props.activation) ?? 'automatic')
    const isDisabled = useDisabled(props.disabled)

    const listId = useId('tabs-list')

    const state: TabsApi['state'] = {
        get value() { return value.value },
        get focusedValue() { return focusedValue.value },
        get orientation() { return orientation.value },
        get activation() { return activation.value },
        get isDisabled() { return isDisabled.value },
        get listId() { return listId },
    }

    const actions: TabsApi['actions'] = {
        select(tabValue: string): void {
            if (isDisabled.value) return
            setValue(tabValue)
        },

        focus(tabValue: string): void {
            focusedValue.value = tabValue
            if (activation.value === 'automatic') {
                actions.select(tabValue)
            }
        },

        isSelected(tabValue: string): boolean {
            return value.value === tabValue
        },

        isFocused(tabValue: string): boolean {
            return focusedValue.value === tabValue
        },
    }

    return { state, actions, bindings: {} }
}