import { reactive } from 'vue'
import { useDisabled } from '../../utils/useDisabled'
import type { UseButtonProps, ButtonApi, ButtonState, ButtonBindings } from './types'

export function useButton(props: UseButtonProps = {}): ButtonApi {
    const isDisabled = useDisabled(props.disabled)

    const state: ButtonState = reactive({
        isDisabled,
    })

    const bindings: ButtonBindings = {
        get button() {
            return {
                disabled: isDisabled.value ? (true as const) : undefined,
                'aria-disabled': isDisabled.value ? (true as const) : undefined,
                'data-disabled': isDisabled.value ? ('' as const) : undefined,
            }
        },
    }

    return { state, actions: {}, bindings }
}