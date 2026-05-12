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

    const activeValue = ref<string | null>(null)
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

        activate: (optionValue: string) => {
            activeValue.value = optionValue
        },

        activateFirst: () => {
            if (registry.value.length > 0) activeValue.value = registry.value[0]
        },

        activateLast: () => {
            if (registry.value.length > 0) activeValue.value = registry.value[registry.value.length - 1]
        },

        activateNext: () => {
            const items = registry.value
            if (items.length === 0) return
            if (activeValue.value === null) { activeValue.value = items[0]; return }
            const index = items.indexOf(activeValue.value)
            const next = items[index + 1]
            if (next !== undefined) activeValue.value = next
        },

        activatePrev: () => {
            const items = registry.value
            if (items.length === 0) return
            if (activeValue.value === null) { activeValue.value = items[items.length - 1]; return }
            const index = items.indexOf(activeValue.value)
            const prev = items[index - 1]
            if (prev !== undefined) activeValue.value = prev
        },

        isSelected: (optionValue: string) => {
            return Array.isArray(value.value)
                ? value.value.includes(optionValue)
                : value.value === optionValue
        },

        isActive: (optionValue: string) => activeValue.value === optionValue,
    }

    const state: ListboxApi['state'] = {
        get value() { return value.value },
        get activeValue() { return activeValue.value },
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
        'aria-activedescendant': activeValue.value ? `${listboxId}-option-${activeValue.value}` : undefined,
        // aria-orientation only set when horizontal — vertical is implicit default
        'aria-orientation': orientation.value === 'horizontal' ? ('horizontal' as const) : undefined,
        tabindex: 0 as const,
        onKeydown: (event: KeyboardEvent) => {
            const prev = orientation.value === 'horizontal' ? Keys.ArrowLeft : Keys.ArrowUp
            const next = orientation.value === 'horizontal' ? Keys.ArrowRight : Keys.ArrowDown

            switch (event.key) {
                case next:
                    event.preventDefault()
                    actions.activateNext()
                    break
                case prev:
                    event.preventDefault()
                    actions.activatePrev()
                    break
                case Keys.Home:
                    event.preventDefault()
                    actions.activateFirst()
                    break
                case Keys.End:
                    event.preventDefault()
                    actions.activateLast()
                    break
                case Keys.Enter:
                case Keys.Space:
                    event.preventDefault()
                    if (activeValue.value !== null) actions.toggle(activeValue.value)
                    break
            }
        },
    }))

    const bindings: ListboxApi['bindings'] = {
        get root() { return rootBindings.value },
        getOptionProps(optionValue: string, userProps?: ListboxOptionUserProps) {
            const isOptionDisabled = userProps?.disabled ?? false
            const isSelected = actions.isSelected(optionValue)
            const isActive = actions.isActive(optionValue)
            const optionId = `${listboxId}-option-${optionValue}`

            return {
                id: optionId,
                role: 'option' as const,
                'aria-selected': isSelected,
                'aria-disabled': isOptionDisabled ? (true as const) : undefined,
                'data-disabled': isOptionDisabled ? ('' as const) : undefined,
                'data-active': isActive ? ('' as const) : undefined,
                'data-selected': isSelected ? ('' as const) : undefined,
                // focus listbox root on mousedown so keyboard navigation works immediately
                onMousedown: (event: MouseEvent) => {
                    event.preventDefault()
                    rootRef.value?.focus()
                },
                onClick: composeHandlers(
                    isOptionDisabled ? undefined : userProps?.onClick,
                    () => { if (!isOptionDisabled && !isDisabled.value) actions.toggle(optionValue) }
                ),
                onMouseenter: () => {
                    if (!isOptionDisabled && !isDisabled.value) actions.activate(optionValue)
                },
            }
        },
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