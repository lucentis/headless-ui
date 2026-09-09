import { computed, ref, toValue, watch, nextTick } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { Keys } from '../../utils/keys'
import { useConfig } from '../../config'
import type { UseSelectProps, SelectApi } from './types'

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

    /// try to focus the content of menu when open for arrow navigation
    
    watch(isOpen, async (newOpen) => {
        if (!newOpen) return
    
        await nextTick()
    
        contentRef.value?.focus()
    })

    const { registry, register, unregister } = useRegistry()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlight, clearHighlight } = useHighlight(registry)

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
        highlight,
        highlightFirst,
        highlightLast,
        highlightNext,
        highlightPrev,
        isHighlighted,
        
        select: (optionValue: string) => {
            if (isDisabled.value) return
            setValue(optionValue)
            close()
        },

        isSelected: (optionValue: string) => value.value === optionValue,
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