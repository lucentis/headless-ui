import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { TabsApi } from './types'

const TabsContextKey: InjectionKey<TabsApi> = Symbol('TabsContext')

export function provideTabsContext(api: TabsApi): void {
    provide(TabsContextKey, api)
}

export function useTabsContext(): TabsApi {
    const context = inject(TabsContextKey)
    if (!context) {
        throw new Error('[headless-ui] useTabsContext must be used within a Tabs')
    }
    return context
}