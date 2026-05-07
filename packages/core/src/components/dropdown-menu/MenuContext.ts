import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { MenuApi } from './types'

const MenuContextKey: InjectionKey<MenuApi> = Symbol('MenuContext')

export function provideMenuContext(api: MenuApi): void {
    provide(MenuContextKey, api)
}

export function useMenuContext(): MenuApi {
    const context = inject(MenuContextKey)
    if (!context) {
        throw new Error('[headless-ui] useMenuContext must be used within a Menu')
    }
    return context
}