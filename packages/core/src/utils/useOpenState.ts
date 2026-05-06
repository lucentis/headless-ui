import { computed } from 'vue'
import type { ComputedRef, MaybeRef } from 'vue'
import { useControllableState } from './useControllableState'

export interface UseOpenStateOptions {
    open?: MaybeRef<boolean>
    defaultOpen?: boolean
    onOpenChange?: (value: boolean) => void
}

export interface OpenState {
    isOpen: ComputedRef<boolean>
    isPresent: ComputedRef<boolean>
    open: () => void
    close: () => void
    toggle: () => void
    setOpen: (value: boolean) => void
}

export function useOpenState(options: UseOpenStateOptions = {}): OpenState {
    const { value, setValue: setOpen } = useControllableState({
        value: options.open,
        defaultValue: options.defaultOpen ?? false,
        onChange: options.onOpenChange,
    })

    const isOpen = computed(() => value.value)

    // isPresent will be replaced by usePresence once built —
    // for now mirrors isOpen since animationDuration defaults to 0
    const isPresent = computed(() => value.value)

    return {
        isOpen,
        isPresent,
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!value.value),
        setOpen,
    }
}