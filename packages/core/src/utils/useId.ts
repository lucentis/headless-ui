import { useConfig } from '../config'

let count = 0

export function useId(prefix?: string): string {
    const config = useConfig()
    return `${prefix ?? config.idPrefix}-${++count}`
}