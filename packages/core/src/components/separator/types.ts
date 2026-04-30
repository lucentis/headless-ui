import type { MaybeRef } from 'vue'
import type { ComponentApi } from '../../types'

export interface UseSeparatorProps {
    orientation?: MaybeRef<'horizontal' | 'vertical'>
    decorative?: MaybeRef<boolean>
}

export interface SeparatorState {
    orientation: 'horizontal' | 'vertical'
    isDecorative: boolean
}

export type SeparatorActions = Record<never, never>

export interface SeparatorBindings {
    root: {
        role: 'separator' | 'none'
        'aria-orientation': 'vertical' | undefined
        'data-orientation': 'horizontal' | 'vertical'
    }
}

export interface SeparatorApi extends ComponentApi<SeparatorState, SeparatorActions, SeparatorBindings> {}