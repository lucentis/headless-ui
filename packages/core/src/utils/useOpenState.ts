import { computed } from 'vue'
import type { ComputedRef, MaybeRef } from 'vue'
import { useControllableState } from './useControllableState'
import { usePresence } from './usePresence'

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
    const { value: isOpen, setValue: setOpen } = useControllableState({
        value: options.open,
        defaultValue: options.defaultOpen ?? false,
        onChange: options.onOpenChange,
    })

    const isPresent = usePresence(isOpen)

    return {
        isOpen,
        isPresent,
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!value.value),
        setOpen,
    }
}