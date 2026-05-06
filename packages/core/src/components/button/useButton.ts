import { useDisabled } from '../../utils/useDisabled'
import type { UseButtonProps, ButtonApi } from './types'

export function useButton(props: UseButtonProps = {}): ButtonApi {
    const isDisabled = useDisabled(props.disabled)

    const state: ButtonApi['state'] = {
        get isDisabled() { return isDisabled.value },
    }

    const bindings: ButtonApi['bindings'] = {
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