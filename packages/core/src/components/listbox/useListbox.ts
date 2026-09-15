import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import type { UseListboxProps, ListboxApi, ListboxRegistryItem, ListboxInternals } from './types'
import { ListboxInternalKey } from '../../keys/internal-keys'

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

    const { registry, register, unregister, updateItem, getItem } = useRegistry<ListboxRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted } = useHighlight(registry)

    const listboxId = useId('listbox')
    const rootRef = ref<HTMLElement | null>(null)

    const actions: ListboxApi['actions'] = {
        highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted,

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
            actions.isSelected(optionValue) ? actions.deselect(optionValue) : actions.select(optionValue)
        },

        isSelected: (optionValue: string) => {
            return Array.isArray(value.value)
                ? value.value.includes(optionValue)
                : value.value === optionValue
        },
    }

    const state: ListboxApi['state'] = {
        get value() { return value.value },
        get highlightValue() { return highlightValue.value },
        get isDisabled() { return isDisabled.value },
        get multiple() { return multiple.value },
        get orientation() { return orientation.value },
        get listboxId() { return listboxId },
    }

    const { onKeydown } = useArrowNavigation({
        orientation,
        onNext: actions.highlightNext,
        onPrev: actions.highlightPrev,
        onFirst: actions.highlightFirst,
        onLast: actions.highlightLast,
        onEnter: () => { if (highlightValue.value !== null) actions.toggle(highlightValue.value) },
        onSpace: () => { if (highlightValue.value !== null) actions.toggle(highlightValue.value) },
    })

    const rootBindings = computed(() => ({
        id: listboxId,
        role: 'listbox' as const,
        'aria-multiselectable': multiple.value ? (true as const) : undefined,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'aria-activedescendant': highlightValue.value ? getItem(highlightValue.value)?.id : undefined,
        'aria-orientation': orientation.value === 'horizontal' ? ('horizontal' as const) : undefined,
        tabindex: 0 as const,
        onKeydown,
    }))

    const bindings: ListboxApi['bindings'] = {
        get root() { return rootBindings.value },
    }

    const internals: ListboxInternals = {
        registerOption: register,
        unregisterOption: unregister,
        updateOption: updateItem,
        rootRef,
    }

    return {
        state,
        actions,
        bindings,
        rootRef,
        [ListboxInternalKey]: internals,
    }
}