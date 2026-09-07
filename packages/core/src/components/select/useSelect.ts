import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useConfig } from '../../config'
import type { UseSelectProps, SelectApi } from './types'

const Keys = {
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    Home: 'Home',
    End: 'End',
    Enter: 'Enter',
    Space: ' ',
    Tab: 'Tab',
} as const

export function useSelect(props: UseSelectProps = {}): SelectApi {
    const config = useConfig()
    const isDisabled = useDisabled(props.disabled)

    const { value, setValue } = useControllableState<string>({
        value: props.value,
        defaultValue: props.defaultValue ?? '',
        onChange: props.onValueChange,
    })

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (val) => {
            if (!val) highlightValue.value = null
            props.onOpenChange?.(val)
        },
    })

    const highlightValue = ref<string | null>(null)
    const registry = ref<string[]>([])
    const labelMap = ref<Map<string, string>>(new Map())

    const triggerId = useId('select-trigger')
    const contentId = useId('select-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    const selectedLabel = computed(() => {
        const v = value.value
        return v ? labelMap.value.get(v) ?? null : null
    })

    const actions: SelectApi['actions'] = {
        open,
        close,
        toggle,

        select: (optionValue: string) => {
            if (isDisabled.value) return
            setValue(optionValue)
            close()
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

        isSelected: (optionValue: string) => value.value === optionValue,
        isHighlight: (optionValue: string) => highlightValue.value === optionValue,
    }

    useEscape({
        active: isOpen,
        onEscape: () => {
            if (config.closeOnEscape) actions.close()
        },
    })

    useOutsideClick({
        targets: [triggerRef, contentRef],
        active: isOpen,
        onOutsideClick: () => {
            if (config.closeOnOutsideClick) actions.close()
        },
    })

    const state: SelectApi['state'] = {
        get value() { return value.value },
        get selectedLabel() { return selectedLabel.value },
        get highlightValue() { return highlightValue.value },
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
        get isDisabled() { return isDisabled.value },
        get placeholder() { return props.placeholder },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        role: 'combobox' as const,
        'aria-haspopup': 'listbox' as const,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        disabled: isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => {
            if (!isDisabled.value) actions.toggle()
        },
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'listbox' as const,
        'aria-labelledby': triggerId,
        'aria-activedescendant': highlightValue.value
            ? `${contentId}-option-${highlightValue.value}`
            : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        tabindex: -1 as const,
        onKeydown: (event: KeyboardEvent) => {
            switch (event.key) {
                case Keys.ArrowDown:
                    event.preventDefault()
                    actions.highlightNext()
                    break
                case Keys.ArrowUp:
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
                    if (highlightValue.value !== null) actions.select(highlightValue.value)
                    break
                case Keys.Tab:
                    actions.close()
                    break
            }
        },
    }))

    const bindings: SelectApi['bindings'] = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    return {
        state,
        actions,
        bindings,
        triggerRef,
        contentRef,
        registerOption: (optionValue: string, label: string) => {
            if (!registry.value.includes(optionValue)) registry.value.push(optionValue)
            labelMap.value.set(optionValue, label)
        },
        unregisterOption: (optionValue: string) => {
            registry.value = registry.value.filter(v => v !== optionValue)
            labelMap.value.delete(optionValue)
        },
    }
}