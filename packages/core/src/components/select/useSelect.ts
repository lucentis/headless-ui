import { computed, ref, watch, reactive, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useOpenState } from '../../utils/useOpenState'
import { useDismiss } from '../../utils/useDismiss'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import { useConfig } from '../../config'
import { warnDev } from '../../utils/warnDev'
import type {
    UseSelectProps,
    SelectApi,
    SelectRegistryItem,
    SelectInternals,
    SelectState,
    SelectActions,
    SelectBindings,
} from './types'
import { SelectInternalKey } from '../../keys/internal-keys'

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
        onOpenChange: props.onOpenChange,
        animationDuration: config.animationDuration,
    })

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    watch(
        isOpen,
        (newOpen) => {
            if (!newOpen) {
                clearHighlight()
                return
            }
            contentRef.value?.focus()
        },
        { flush: 'post' },
    )

    const { registry, register, unregister, getItem } = useRegistry<SelectRegistryItem>()
    const {
        highlightValue,
        highlight,
        highlightFirst,
        highlightLast,
        highlightNext,
        highlightPrev,
        isHighlighted,
        clearHighlight,
    } = useHighlight(registry)

    const triggerId = useId('select-trigger')
    const contentId = useId('select-content')

    const placeholder = computed(() => toValue(props.placeholder))

    const selectedLabel = computed(() => {
        const v = value.value
        return v ? (getItem(v)?.label ?? null) : null
    })

    useDismiss({
        active: isOpen,
        targets: [triggerRef, contentRef],
        onDismiss: close,
        escape: config.closeOnEscape,
        outsideClick: config.closeOnOutsideClick,
    })

    const state: SelectState = reactive({
        value,
        selectedLabel,
        highlightValue,
        isOpen,
        isPresent,
        isDisabled,
        placeholder,
    })

    const actions: SelectActions = {
        highlight,
        highlightFirst,
        highlightLast,
        highlightNext,
        highlightPrev,
        isHighlighted,
        open: () => {
            if (isDisabled.value) {
                warnDev('useSelect().actions.open()', 'Cannot open the Select because it is disabled.')
                return
            }
            open()
        },
        close,
        toggle: () => {
            if (isDisabled.value) {
                warnDev('useSelect().actions.toggle()', 'Cannot toggle the Select because it is disabled.')
                return
            }
            toggle()
        },
        select: (optionValue: string) => {
            if (isDisabled.value) {
                warnDev('useSelect().actions.select()', 'Cannot select an option because the Select is disabled.')
                return
            }

            const option = getItem(optionValue)

            if (!option) {
                warnDev(
                    'useSelect().actions.select()',
                    `Cannot select "${optionValue}" because no option with this value is registered.`,
                )
                return
            }

            if (option.disabled.value) {
                warnDev('useSelect().actions.select()', `Cannot select the disabled option "${optionValue}".`)
                return
            }

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

    // Keyboard activation is an internal flow: a disabled target is a legitimate no-op, not a usage error.
    function selectHighlighted(): void {
        const current = highlightValue.value
        if (current === null) return

        const option = getItem(current)
        if (!option || isDisabled.value || option.disabled.value) return

        actions.select(current)
    }

    const { onKeydown: onArrowKeydown } = useArrowNavigation({
        onNext: actions.highlightNext,
        onPrev: actions.highlightPrev,
        onFirst: actions.highlightFirst,
        onLast: actions.highlightLast,
        onEnter: selectHighlighted,
        onSpace: selectHighlighted,
    })

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'listbox' as const,
        'aria-labelledby': triggerId,
        'aria-activedescendant': highlightValue.value ? getItem(highlightValue.value)?.id : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        tabindex: -1 as const,
        onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                actions.close()
                return
            }
            onArrowKeydown(event)
        },
    }))

    const bindings: SelectBindings = {
        get trigger() {
            return triggerBindings.value
        },
        get content() {
            return contentBindings.value
        },
    }

    const internals: SelectInternals = {
        registerOption: register,
        unregisterOption: unregister,
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
