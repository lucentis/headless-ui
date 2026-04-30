import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseButtonProps {
    disabled?: MaybeRef<boolean>
}

export interface ButtonState {
    isDisabled: boolean
}

export type ButtonActions = Record<never, never>

export interface ButtonElementProps {
    button: {
        disabled: true | undefined
        'aria-disabled': true | undefined
        'data-disabled': '' | undefined
    }
}

export interface ButtonApi extends ComponentApi<ButtonState, ButtonActions, ButtonElementProps> {}