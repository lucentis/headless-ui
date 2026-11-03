import type { MaybeRef } from 'vue'
import type { ComponentApi, AriaOrientation } from '../../types'

export interface UseSeparatorProps {
    /** Defaults to `'horizontal'`. `aria-orientation` is only exposed when vertical and not decorative. */
    orientation?: MaybeRef<AriaOrientation>
    /** A decorative separator has `role="none"` and is hidden from assistive technologies. Defaults to `false`. */
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
