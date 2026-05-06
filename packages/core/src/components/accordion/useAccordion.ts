import { computed, toValue } from 'vue'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import type { UseAccordionProps, AccordionApi } from './types'

export function useAccordion(props: UseAccordionProps = {}): AccordionApi {
    const type = computed(() => props.type ?? 'single')
    const isDisabled = useDisabled(props.disabled)

    const defaultValue = props.defaultValue ?? (type.value === 'multiple' ? [] : '')

    const { value, setValue } = useControllableState<string | string[]>({
        value: props.value,
        defaultValue,
        onChange: props.onValueChange,
    })

    const state: AccordionApi['state'] = {
        get value() { return value.value },
        get isDisabled() { return isDisabled.value },
        get type() { return type.value },
    }

    const actions: AccordionApi['actions'] = {
        isExpanded(itemValue: string): boolean {
            const current = value.value
            return Array.isArray(current)
                ? current.includes(itemValue)
                : current === itemValue
        },

        expand(itemValue: string): void {
            if (isDisabled.value) return
            const current = value.value

            if (type.value === 'multiple') {
                const arr = Array.isArray(current) ? current : [current]
                if (!arr.includes(itemValue)) setValue([...arr, itemValue])
            } else {
                setValue(itemValue)
            }
        },

        collapse(itemValue: string): void {
            if (isDisabled.value) return
            const current = value.value

            if (type.value === 'multiple') {
                const arr = Array.isArray(current) ? current : [current]
                setValue(arr.filter(v => v !== itemValue))
            } else {
                if (current === itemValue) setValue('')
            }
        },

        toggle(itemValue: string): void {
            actions.isExpanded(itemValue)
                ? actions.collapse(itemValue)
                : actions.expand(itemValue)
        },
    }

    return { state, actions, bindings: {} }
}