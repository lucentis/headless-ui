import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { CollapsibleApi } from './types'

const CollapsibleContextKey: InjectionKey<CollapsibleApi> = Symbol('CollapsibleContext')

export function provideCollapsibleContext(api: CollapsibleApi): void {
    provide(CollapsibleContextKey, api)
}

export function useCollapsibleContext(): CollapsibleApi {
    const context = inject(CollapsibleContextKey)
    if (!context) {
        throw new Error('[headless-ui] useCollapsibleContext must be used within a Collapsible')
    }
    return context
}