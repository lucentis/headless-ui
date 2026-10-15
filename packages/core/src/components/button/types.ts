import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseButtonProps {
    /** Exposes `disabled`, `aria-disabled` and `data-disabled` on the bindings, so it works on native and non-native elements. */
    disabled?: MaybeRef<boolean>
}

export interface ButtonState {
    isDisabled: boolean
}

export type ButtonActions = Record<never, never>

export interface ButtonBindings {
    root: {
        disabled: true | undefined
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
    }
}

export interface ButtonApi extends ComponentApi<ButtonState, ButtonActions, ButtonBindings> {}
