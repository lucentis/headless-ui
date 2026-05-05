import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { PopoverApi } from './types'

const PopoverContextKey: InjectionKey<PopoverApi> = Symbol('PopoverContext')

export function providePopoverContext(api: PopoverApi): void {
    provide(PopoverContextKey, api)
}

export function usePopoverContext(): PopoverApi {
    const context = inject(PopoverContextKey)
    if (!context) {
        throw new Error('[headless-ui] usePopoverContext must be used within a Popover')
    }
    return context
}