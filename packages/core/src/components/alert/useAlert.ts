import { computed, ref, toValue } from 'vue'
import type { UseAlertProps, AlertApi } from './types'

export function useAlert(props: UseAlertProps = {}): AlertApi {
    const isControlled = props.open !== undefined
    const internalOpen = ref(props.defaultOpen ?? false)

    const isOpen = computed(() => isControlled ? toValue(props.open) as boolean : internalOpen.value)
    const role = computed(() => toValue(props.role) ?? 'status')

    function setOpen(value: boolean): void {
        if (!isControlled) internalOpen.value = value
        props.onOpenChange?.(value)
    }

    const state: AlertApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isOpen.value },
    }

    const actions: AlertApi['actions'] = {
        open: () => setOpen(true),
        close: () => setOpen(false),
    }

    const rootBindings = computed(() => ({
        role: role.value,
        'aria-live': role.value === 'alert' ? ('assertive' as const) : ('polite' as const),
        'aria-atomic': true as const,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: AlertApi['bindings'] = {
        get root() { return rootBindings.value },
    }

    return { state, actions, bindings }
}