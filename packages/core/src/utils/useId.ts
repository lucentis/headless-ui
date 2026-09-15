import { useId as useVueId } from 'vue'
import { useConfig } from '../config'

export function useId(prefix?: string): string {
    const config = useConfig()
    const id = useVueId()

    return `${prefix ?? config.idPrefix}-${id}`
}