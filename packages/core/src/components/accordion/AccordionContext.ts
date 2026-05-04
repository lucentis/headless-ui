import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { AccordionApi } from './types'

const AccordionContextKey: InjectionKey<AccordionApi> = Symbol('AccordionContext')

export function provideAccordionContext(api: AccordionApi): void {
    provide(AccordionContextKey, api)
}

export function useAccordionContext(): AccordionApi {
    const context = inject(AccordionContextKey)
    if (!context) {
        throw new Error('[headless-ui] useAccordionContext must be used within an Accordion')
    }
    return context
}