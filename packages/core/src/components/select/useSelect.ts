import { computed, ref, watch, reactive } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useOpenState } from '../../utils/useOpenState'
import { useDismiss } from '../../utils/useDismiss'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import { useConfig } from '../../config'
import type { UseSelectProps, SelectApi, SelectRegistryItem, SelectInternals, SelectState, SelectActions, SelectBindings } from './types'
import { SelectInternalKey } from '../../keys/internal-keys'

export function useSelect(props: UseSelectProps = {}): SelectApi {
    const config = useConfig()
    const isDisabled = useDisabled(props.disabled)

    const triggerId = useId('select-trigger')
    const contentId = useId('select-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    const { value, setValue } = useControllableState<string>({
        value: props.value,
        defaultValue: props.defaultValue ?? '',
        onChange: props.onValueChange,
    })

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (val) => {
            if (!val) clearHighlight()
            props.onOpenChange?.(val)
        },
        animationDuration: config.animationDuration,
    })

    const { registry, register, unregister, updateItem, getItem } = useRegistry<SelectRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted, clearHighlight } = useHighlight(registry)
    
    const selectedLabel = computed(() => {
        const v = value.value
        return v ? getItem(v)?.label ?? null : null
    })

    useDismiss({
        active: isOpen,
        targets: [triggerRef, contentRef],
        onDismiss: close,
        escape: config.closeOnEscape,
        outsideClick: config.closeOnOutsideClick,
    })

    watch(isOpen, (newOpen) => {
        if (!newOpen) return
        contentRef.value?.focus()
    }, { flush: 'post' })

    const state = reactive<SelectState>({
        value,
        selectedLabel,
        highlightValue,
        isOpen,
        isPresent,
        isDisabled,
        placeholder: props.placeholder,    
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
        onNext: highlightNext,
        onPrev: highlightPrev,
        onFirst: highlightFirst,
        onLast: highlightLast,
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