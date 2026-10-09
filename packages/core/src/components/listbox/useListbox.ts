import { computed, ref, toValue, reactive } from 'vue'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import { useId } from '../../utils/useId'
import type {
    UseListboxProps,
    ListboxApi,
    ListboxRegistryItem,
    ListboxInternals,
    ListboxState,
    ListboxActions,
    ListboxBindings,
} from './types'
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

    const { registry, register, unregister, getItem } = useRegistry<ListboxRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted } =
        useHighlight(registry)

    const listboxId = useId('listbox')
    const rootRef = ref<HTMLElement | null>(null)

    const state: ListboxState = reactive({
        value,
        highlightValue,
        isDisabled,
        multiple,
        orientation,
    })

    const actions: ListboxActions = {
        highlight,
        highlightFirst,
        highlightLast,
        highlightNext,
        highlightPrev,
        isHighlighted,

        select: (optionValue: string) => {
            if (isDisabled.value) {
                warnDev('useListbox().actions.select()', 'Cannot select an option because the Listbox is disabled.')
                return
            }

            const option = getItem(optionValue)

            if (!option) {
                warnDev(
                    'useListbox().actions.select()',
                    `Cannot select "${optionValue}" because no option with this value is registered.`,
                )
                return
            }

            if (option.disabled.value) {
                warnDev('useListbox().actions.select()', `Cannot select the disabled option "${optionValue}".`)
                return
            }

            if (multiple.value) {
                const current = Array.isArray(value.value) ? value.value : []

                if (!current.includes(optionValue)) {
                    setValue([...current, optionValue])
                }
            } else {
                setValue(optionValue)
            }
        },

        toggle: (optionValue: string) => {
            const option = getItem(optionValue)

            if (!option) {
                warnDev(
                    'useListbox().actions.toggle()',
                    `Cannot toggle "${optionValue}" because no option with this value is registered.`,
                )
                return
            }

            if (isDisabled.value || option.disabled.value) {
                warnDev(
                    'useListbox().actions.toggle()',
                    `Cannot toggle the option "${optionValue}" because it or its Listbox is disabled.`,
                )
                return
            }

            if (actions.isSelected(optionValue)) {
                actions.deselect(optionValue)
            } else {
                actions.select(optionValue)
            }
        },

        deselect: (optionValue: string) => {
            if (isDisabled.value) return
            if (multiple.value) {
                const current = Array.isArray(value.value) ? value.value : []
                setValue(current.filter((v) => v !== optionValue))
            } else {
                if (value.value === optionValue) setValue('')
            }
        },

        isSelected: (optionValue: string) => {
            return Array.isArray(value.value) ? value.value.includes(optionValue) : value.value === optionValue
        },
    }

    const { onKeydown } = useArrowNavigation({
        orientation,
        onNext: actions.highlightNext,
        onPrev: actions.highlightPrev,
        onFirst: actions.highlightFirst,
        onLast: actions.highlightLast,
        onEnter: () => {
            if (highlightValue.value !== null) actions.toggle(highlightValue.value)
        },
        onSpace: () => {
            if (highlightValue.value !== null) actions.toggle(highlightValue.value)
        },
    })

    const rootBindings = computed(() => ({
        id: listboxId,
        role: 'listbox' as const,
        'aria-multiselectable': multiple.value ? (true as const) : undefined,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'aria-activedescendant': highlightValue.value ? getItem(highlightValue.value)?.id : undefined,
        'aria-orientation': orientation.value === 'horizontal' ? ('horizontal' as const) : undefined,
        'data-orientation': orientation.value,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        tabindex: 0 as const,
        onKeydown,
    }))

    const bindings: ListboxBindings = {
        get root() {
            return rootBindings.value
        },
    }

    const internals: ListboxInternals = {
        registerOption: register,
        unregisterOption: unregister,
    }

    return {
        state,
        actions,
        bindings,
        rootRef,
        [ListboxInternalKey]: internals,
    }
}
