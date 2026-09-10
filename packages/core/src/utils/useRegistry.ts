import { ref } from 'vue'
import type { Ref } from 'vue'

export interface UseRegistryReturn<T extends { value: string }> {
    registry: Ref<T[]>
    register: (item: T) => void
    unregister: (value: string) => void
    updateItem: (value: string, patch: Partial<Omit<T, 'value'>>) => void
    getItem: (value: string) => T | undefined
}

export function useRegistry<T extends { value: string }>(): UseRegistryReturn<T> {
    const registry = ref<T[]>([]) as Ref<T[]>

    function register(item: T): void {
        if (!registry.value.some(i => i.value === item.value)) {
            registry.value.push(item)
        }
    }

    function unregister(value: string): void {
        registry.value = registry.value.filter(i => i.value !== value)
    }

    function updateItem(value: string, patch: Partial<Omit<T, 'value'>>): void {
        const index = registry.value.findIndex(i => i.value === value)
        if (index !== -1) {
            registry.value[index] = { ...registry.value[index], ...patch }
        }
    }

    function getItem(value: string): T | undefined {
        return registry.value.find(i => i.value === value)
    }

    return { registry, register, unregister, updateItem, getItem }
}