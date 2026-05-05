import { computed, toValue } from 'vue'
import { useControllableState } from '../../utils/useControllableState'
import type { UseAlertProps, AlertApi } from './types'

export function useAlert(props: UseAlertProps = {}): AlertApi {
    const { value: isOpen, setValue: setOpen } = useControllableState({
        value: props.open,
        defaultValue: props.defaultOpen ?? false,
        onChange: props.onOpenChange,
    })

    const role = computed(() => toValue(props.role) ?? 'status')

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