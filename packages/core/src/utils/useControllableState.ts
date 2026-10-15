import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRef } from 'vue'
import { warnDev } from './warnDev'

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
    const internal = ref<T>(options.defaultValue)

    const value = computed<T>(() => (isControlled ? (toValue(options.value) as T) : (internal.value as T)))

    function setValue(next: T): void {
        if (next === value.value) return

        if (isControlled && !options.onChange) {
            warnDev(
                'useControllableState()',
                'The state is controlled but no change callback was provided, so this change is ignored. ' +
                    'Provide the matching onChange callback (for example onValueChange or onOpenChange), ' +
                    'or remove the controlled value to let the component manage its own state.',
            )
        }

        if (!isControlled) internal.value = next as typeof internal.value
        options.onChange?.(next)
    }

    return { value, setValue }
}
