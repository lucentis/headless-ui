import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { SelectApi } from './types'

const SelectContextKey: InjectionKey<SelectApi> = Symbol('SelectContext')

export function provideSelectContext(api: SelectApi): void {
    provide(SelectContextKey, api)
}

export function useSelectContext(): SelectApi {
    const context = inject(SelectContextKey)
    if (!context) {
        throw new Error('[headless-ui] useSelectContext must be used within a Select')
    }
    return context
}