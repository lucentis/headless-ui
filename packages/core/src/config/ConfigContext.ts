import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import { defaults } from './defaults'
import type { HeadlessUIConfig } from './types'

const ConfigContextKey: InjectionKey<Required<HeadlessUIConfig>> = Symbol('HeadlessUIConfig')

export function provideConfig(config: Partial<HeadlessUIConfig>): void {
    provide(ConfigContextKey, { ...defaults, ...config })
}

export function useConfig(): Required<HeadlessUIConfig> {
    return inject(ConfigContextKey, defaults)
}