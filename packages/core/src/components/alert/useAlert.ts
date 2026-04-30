import { computed, reactive, toValue } from 'vue'
import type { UseAlertProps, AlertApi } from './types'

export function useAlert(props: UseAlertProps = {}): AlertApi {
    // controlled mode is fixed at creation — open prop should not switch between defined/undefined
    const isControlled = props.open !== undefined
    const internalOpen = reactive({ value: props.defaultOpen ?? false })

    const isOpen = computed(() => isControlled ? toValue(props.open)! : internalOpen.value)

    function setOpen(value: boolean): void {
        if (!isControlled) internalOpen.value = value
        props.onOpenChange?.(value)
    }

    const role = computed(() => toValue(props.role) ?? 'status')

    const state: AlertApi['state'] = {
        get isOpen() { return isOpen.value },
        // isPresent mirrors isOpen — will diverge when animationDuration is supported
        get isPresent() { return isOpen.value },
    }

    const actions: AlertApi['actions'] = {
        open: () => setOpen(true),
        close: () => setOpen(false),
    }

    const bindings: AlertApi['bindings'] = {
        get root() {
            return {
                role: role.value,
                'aria-live': role.value === 'alert' ? ('assertive' as const) : ('polite' as const),
                'aria-atomic': true as const,
                'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
            }
        },
    }

    return { state, actions, bindings }
}