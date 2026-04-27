import { readonly, ref } from 'vue'
import type { Ref } from 'vue'
import { useConfig } from '../config'

let count = 0

export function useId(prefix?: string): Readonly<Ref<string>> {
  const config = useConfig()
  const id = ref(`${prefix ?? config.idPrefix}-${++count}`)
  return readonly(id)
}