import { readonly, ref } from 'vue'
import type { Ref } from 'vue'
import { useConfig } from '../config'

let count = 0

export function useId(prefix?: string): Readonly<Ref<string>> {
    const config = useConfig()
    return `${prefix ?? config.idPrefix}-${++count}`
}