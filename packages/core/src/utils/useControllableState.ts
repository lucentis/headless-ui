import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRef } from 'vue'

export interface UseControllableStateOptions<T> {
    value?: MaybeRef<T>
    defaultValue: T
    onChange?: (value: T) => void
}

export interface ControllableState<T> {
    value: ComputedRef<T>
    setValue: (next: T) => void
}

export function useControllableState<T>(options: UseControllableStateOptions<T>): ControllableState<T> {
    const isControlled = options.value !== undefined
    const internal = ref(options.defaultValue) as ReturnType<typeof ref<T>>

    const value = computed<T>(() =>
        isControlled ? toValue(options.value) as T : internal.value as T
    )

    function setValue(next: T): void {
        if (!isControlled) internal.value = next as typeof internal.value
        options.onChange?.(next)
    }

    return { value, setValue }
}