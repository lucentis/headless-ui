import type { MaybeRef } from 'vue'
import type { ComponentApi, AriaOrientation } from '../../types'

export interface UseSeparatorProps {
    orientation?: MaybeRef<AriaOrientation>
    decorative?: MaybeRef<boolean>
}

export interface SeparatorState {
    orientation: AriaOrientation
    isDecorative: boolean
}

export type SeparatorActions = Record<never, never>

export interface SeparatorBindings {
    root: {
        role: 'separator' | 'none'
        'aria-orientation': 'vertical' | undefined
        'data-orientation': AriaOrientation
    }
}

export interface SeparatorApi extends ComponentApi<SeparatorState, SeparatorActions, SeparatorBindings> {}
