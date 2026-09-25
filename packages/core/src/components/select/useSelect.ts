import { computed, ref, watch, reactive } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import { useConfig } from '../../config'
import type { UseSelectProps, SelectApi, SelectRegistryItem, SelectInternals, SelectState, SelectActions, SelectBindings } from './types'
import { SelectInternalKey } from '../../keys/internal-keys'

export function useSelect(props: UseSelectProps = {}): SelectApi {
    const config = useConfig()
    const isDisabled = useDisabled(props.disabled)

    const { value, setValue } = useControllableState<string>({
        value: props.value,
        defaultValue: props.defaultValue ?? '',
        onChange: props.onValueChange,
        animationDuration: config.animationDuration
    })

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (val) => {
            if (!val) clearHighlight()
            props.onOpenChange?.(val)
        },
    })

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    watch(isOpen, (newOpen) => {
        if (!newOpen) return
        contentRef.value?.focus()
    }, { flush: 'post' })

    const { registry, register, unregister, updateItem, getItem } = useRegistry<SelectRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted, clearHighlight } = useHighlight(registry)

    const triggerId = useId('select-trigger')
    const contentId = useId('select-content')

    const selectedLabel = computed(() => {
        const v = value.value
        return v ? getItem(v)?.label ?? null : null
    })

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

    const state = reactive<SelectState>({
        get value() { return value.value },
        get selectedLabel() { return selectedLabel.value },
        get highlightValue() { return highlightValue.value },
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
        get isDisabled() { return isDisabled.value },
        get placeholder() { return props.placeholder },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    })

    const actions: SelectActions = {
        open, close, toggle,
        highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted,

        select: (optionValue: string) => {
            if (isDisabled.value) return
            setValue(optionValue)
            close()
        },

        isSelected: (optionValue: string) => value.value === optionValue,
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

    const { onKeydown: onArrowKeydown } = useArrowNavigation({
        onNext: actions.highlightNext,
        onPrev: actions.highlightPrev,
        onFirst: actions.highlightFirst,
        onLast: actions.highlightLast,
        onEnter: () => { if (highlightValue.value !== null) actions.select(highlightValue.value) },
        onSpace: () => { if (highlightValue.value !== null) actions.select(highlightValue.value) },
    })

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'listbox' as const,
        'aria-labelledby': triggerId,
        'aria-activedescendant': highlightValue.value ? getItem(highlightValue.value)?.id : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        tabindex: -1 as const,
        onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Tab') { actions.close(); return }
            onArrowKeydown(event)
        },
    }))

    const bindings: SelectBindings = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    const internals: SelectInternals = {
        registerOption: register,
        unregisterOption: unregister,
        updateOption: updateItem,
    }

    return {
        state,
        actions,
        bindings,
        triggerRef,
        contentRef,
        [SelectInternalKey]: internals,
    }
}