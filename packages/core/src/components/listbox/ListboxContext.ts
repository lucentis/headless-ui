import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { ListboxApi } from './types'

const ListboxContextKey: InjectionKey<ListboxApi> = Symbol('ListboxContext')

export function provideListboxContext(api: ListboxApi): void {
    provide(ListboxContextKey, api)
}

export function useListboxContext(): ListboxApi {
    const context = inject(ListboxContextKey)
    if (!context) {
        throw new Error('[headless-ui] useListboxContext must be used within a Listbox')
    }
    return context
}