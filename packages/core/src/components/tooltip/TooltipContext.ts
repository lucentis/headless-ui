import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { TooltipApi } from './types'

const TooltipContextKey: InjectionKey<TooltipApi> = Symbol('TooltipContext')

export function provideTooltipContext(api: TooltipApi): void {
    provide(TooltipContextKey, api)
}

export function useTooltipContext(): TooltipApi {
    const context = inject(TooltipContextKey)
    if (!context) {
        throw new Error('[headless-ui] useTooltipContext must be used within a Tooltip')
    }
    return context
}