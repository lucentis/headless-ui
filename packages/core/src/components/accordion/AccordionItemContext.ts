import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { AccordionItemApi } from './types'

const AccordionItemContextKey: InjectionKey<AccordionItemApi> = Symbol('AccordionItemContext')

export function provideAccordionItemContext(api: AccordionItemApi): void {
    provide(AccordionItemContextKey, api)
}

export function useAccordionItemContext(): AccordionItemApi {
    const context = inject(AccordionItemContextKey)
    if (!context) {
        throw new Error('[headless-ui] useAccordionItemContext must be used within an AccordionItem')
    }
    return context
}
