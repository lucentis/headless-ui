import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { DialogApi } from './types'

const DialogContextKey: InjectionKey<DialogApi> = Symbol('DialogContext')

export function provideDialogContext(api: DialogApi): void {
    provide(DialogContextKey, api)
}

export function useDialogContext(): DialogApi {
    const context = inject(DialogContextKey)
    if (!context) {
        throw new Error('[headless-ui] useDialogContext must be used within a Dialog')
    }
    return context
}