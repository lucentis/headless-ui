import { computed, readonly, reactive, toValue } from 'vue'
import type { UseAlertProps, AlertApi } from './types'

export function useAlert(props: UseAlertProps = {}): AlertApi {
    // controlled mode when open prop is provided, uncontrolled otherwise
    const isControlled = computed(() => props.open !== undefined)
    const internalOpen = reactive({ value: props.defaultOpen ?? true })

    const isOpen = computed(() => {
        return isControlled.value ? toValue(props.open)! : internalOpen.value
    })

    function setOpen(value: boolean): void {
        if (!isControlled.value) {
            internalOpen.value = value
        }
        props.onOpenChange?.(value)
    }

    const role = computed(() => toValue(props.role) ?? 'status')

    const state = readonly(reactive({
        get isOpen() { return isOpen.value },
        // isPresent mirrors isOpen — will diverge when animationDuration is supported
        get isPresent() { return isOpen.value },
    }))

    const actions: AlertApi['actions'] = {
        open: () => setOpen(true),
        close: () => setOpen(false),
    }

    const bindings = readonly(reactive({
        get root() {
            return {
                role: role.value,
                'aria-live': role.value === 'alert' ? ('assertive' as const) : ('polite' as const),
                'aria-atomic': true as const,
                'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
            }
        },
    }))

    return {
        state: state as AlertApi['state'],
        actions,
        bindings: bindings as AlertApi['bindings'],
    }
}