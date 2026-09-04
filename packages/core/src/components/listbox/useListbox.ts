import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { composeHandlers } from '../../utils/eventHandler'
import type { UseListboxProps, ListboxApi, ListboxOptionUserProps } from './types'

const Keys = {
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Home: 'Home',
    End: 'End',
    Enter: 'Enter',
    Space: ' ',
} as const

export function useListbox(props: UseListboxProps = {}): ListboxApi {
    const multiple = computed(() => toValue(props.multiple) ?? false)
    const orientation = computed(() => toValue(props.orientation) ?? 'vertical')
    const isDisabled = useDisabled(props.disabled)

    const defaultValue = props.defaultValue ?? (multiple.value ? [] : '')
    const { value, setValue } = useControllableState<string | string[]>({
        value: props.value,
        defaultValue,
        onChange: props.onValueChange,
    })

    const highlightValue = ref<string | null>(null)
    const registry = ref<string[]>([])
    const listboxId = useId('listbox')
    const rootRef = ref<HTMLElement | null>(null)

    const actions: ListboxApi['actions'] = {
        select: (optionValue: string) => {
            if (isDisabled.value) return
            if (multiple.value) {
                const current = Array.isArray(value.value) ? value.value : []
                if (!current.includes(optionValue)) setValue([...current, optionValue])
            } else {
                setValue(optionValue)
            }
        },

        deselect: (optionValue: string) => {
            if (isDisabled.value) return
            if (multiple.value) {
                const current = Array.isArray(value.value) ? value.value : []
                setValue(current.filter(v => v !== optionValue))
            } else {
                if (value.value === optionValue) setValue('')
            }
        },

        toggle: (optionValue: string) => {
            actions.isSelected(optionValue)
                ? actions.deselect(optionValue)
                : actions.select(optionValue)
        },

        highlight: (optionValue: string) => {
            highlightValue.value = optionValue
        },

        highlightFirst: () => {
            if (registry.value.length > 0) highlightValue.value = registry.value[0]
        },

        highlightLast: () => {
            if (registry.value.length > 0) highlightValue.value = registry.value[registry.value.length - 1]
        },

        highlightNext: () => {
            const items = registry.value
            if (items.length === 0) return
            if (highlightValue.value === null) { highlightValue.value = items[0]; return }
            const index = items.indexOf(highlightValue.value)
            const next = items[index + 1]
            if (next !== undefined) highlightValue.value = next
        },

        highlightPrev: () => {
            const items = registry.value
            if (items.length === 0) return
            if (highlightValue.value === null) { highlightValue.value = items[items.length - 1]; return }
            const index = items.indexOf(highlightValue.value)
            const prev = items[index - 1]
            if (prev !== undefined) highlightValue.value = prev
        },

        isSelected: (optionValue: string) => {
            return Array.isArray(value.value)
                ? value.value.includes(optionValue)
                : value.value === optionValue
        },

        isHighlighted: (optionValue: string) => highlightValue.value === optionValue,
    }

    const state: ListboxApi['state'] = {
        get value() { return value.value },
        get highlightValue() { return highlightValue.value },
        get isDisabled() { return isDisabled.value },
        get multiple() { return multiple.value },
        get orientation() { return orientation.value },
        get listboxId() { return listboxId },
    }

    const rootBindings = computed(() => ({
        id: listboxId,
        role: 'listbox' as const,
        'aria-multiselectable': multiple.value ? (true as const) : undefined,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'aria-activedescendant': highlightValue.value ? `${listboxId}-option-${highlightValue.value}` : undefined,
        // aria-orientation only set when horizontal — vertical is implicit default
        'aria-orientation': orientation.value === 'horizontal' ? ('horizontal' as const) : undefined,
        tabindex: 0 as const,
        onKeydown: (event: KeyboardEvent) => {
            const prev = orientation.value === 'horizontal' ? Keys.ArrowLeft : Keys.ArrowUp
            const next = orientation.value === 'horizontal' ? Keys.ArrowRight : Keys.ArrowDown

            switch (event.key) {
                case next:
                    event.preventDefault()
                    actions.highlightNext()
                    break
                case prev:
                    event.preventDefault()
                    actions.highlightPrev()
                    break
                case Keys.Home:
                    event.preventDefault()
                    actions.highlightFirst()
                    break
                case Keys.End:
                    event.preventDefault()
                    actions.highlightLast()
                    break
                case Keys.Enter:
                case Keys.Space:
                    event.preventDefault()
                    if (highlightValue.value !== null) actions.toggle(highlightValue.value)
                    break
            }
        },
    }))

    const bindings: ListboxApi['bindings'] = {
        get root() { return rootBindings.value },
    }

    return {
        state,
        actions,
        bindings,
        rootRef,
        registerOption: (optionValue: string) => {
            if (!registry.value.includes(optionValue)) registry.value.push(optionValue)
        },
        unregisterOption: (optionValue: string) => {
            registry.value = registry.value.filter(v => v !== optionValue)
        },
    }
}