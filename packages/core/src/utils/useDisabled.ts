import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRef } from 'vue'

export function useDisabled(disabled?: MaybeRef<boolean>): ComputedRef<boolean> {
    return computed(() => toValue(disabled) ?? false)
}