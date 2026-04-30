import { computed, readonly, reactive, toValue } from 'vue'
import type { UseButtonProps, ButtonApi } from './types'

export function useButton(props: UseButtonProps = {}): ButtonApi {
    const isDisabled = computed(() => toValue(props.disabled) ?? false)

    const state = readonly(reactive({
        get isDisabled() { return isDisabled.value },
    }))

    const bindings = readonly(reactive({
        get button() {
            return {
                disabled: isDisabled.value ? (true as const) : undefined,
                'aria-disabled': isDisabled.value ? (true as const) : undefined,
                'data-disabled': isDisabled.value ? ('' as const) : undefined,
            }
        },
    }))

    return {
        state: state as ButtonApi['state'],
        actions: {},
        bindings: bindings as ButtonApi['bindings'],
    }
}