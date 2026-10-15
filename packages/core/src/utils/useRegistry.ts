import { shallowRef, triggerRef } from 'vue'
import type { ShallowRef } from 'vue'
import { warnDev } from './warnDev'

export interface UseRegistryReturn<T extends { value: string }> {
    registry: ShallowRef<T[]>
    register: (item: T) => void
    unregister: (value: string) => void
    updateItem: (value: string, patch: Partial<Omit<T, 'value'>>) => void
    getItem: (value: string) => T | undefined
}

export function useRegistry<T extends { value: string }>(): UseRegistryReturn<T> {
    const registry = shallowRef<T[]>([]) as ShallowRef<T[]>

    function register(item: T): void {
        if (registry.value.some((i) => i.value === item.value)) {
            warnDev(
                'useRegistry()',
                `An item with the value "${item.value}" is already registered. Values must be unique, the duplicate is ignored.`,
            )
            return
        }

        registry.value.push(item)
        triggerRef(registry)
    }

    function unregister(value: string): void {
        registry.value = registry.value.filter((i) => i.value !== value)
    }

    function updateItem(value: string, patch: Partial<Omit<T, 'value'>>): void {
        const index = registry.value.findIndex((i) => i.value === value)
        if (index !== -1) {
            registry.value[index] = { ...registry.value[index], ...patch }
        }
        triggerRef(registry)
    }

    function getItem(value: string): T | undefined {
        return registry.value.find((i) => i.value === value)
    }

    return { registry, register, unregister, updateItem, getItem }
}
