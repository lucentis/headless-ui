import { computed, toValue } from 'vue'
import { useOpenState } from '../../utils/useOpenState'
import type { UseAlertProps, AlertApi } from './types'

export function useAlert(props: UseAlertProps = {}): AlertApi {
    const { isOpen, isPresent, open, close } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen ?? true,
        onOpenChange: props.onOpenChange,
    })

    const role = computed(() => toValue(props.role) ?? 'status')

    const state: AlertApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
    }

    const actions: AlertApi['actions'] = { open, close }

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