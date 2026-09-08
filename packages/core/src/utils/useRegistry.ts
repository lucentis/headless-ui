import { ref } from 'vue'

export interface UseRegistryReturn {
    registry: ReturnType<typeof ref<string[]>>
    register: (value: string) => void
    unregister: (value: string) => void
}

export function useRegistry(): UseRegistryReturn {
    const registry = ref<string[]>([])

    function register(value: string): void {
        if (!registry.value.includes(value)) {
            registry.value.push(value)
        }
    }

    function unregister(value: string): void {
        registry.value = registry.value.filter(v => v !== value)
    }

    return { registry, register, unregister }
}