import { computed, ref, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useConfig } from '../../config'
import type { UsePopoverProps, PopoverApi } from './types'

export function usePopover(props: UsePopoverProps = {}): PopoverApi {
    const config = useConfig()
    const isControlled = props.open !== undefined
    const internalOpen = ref(props.defaultOpen ?? false)

    const isOpen = computed(() => isControlled ? toValue(props.open) as boolean : internalOpen.value)

    const triggerId = useId('popover-trigger')
    const contentId = useId('popover-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    function setOpen(value: boolean): void {
        if (!isControlled) internalOpen.value = value
        props.onOpenChange?.(value)
    }

    const actions: PopoverApi['actions'] = {
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!isOpen.value),
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

    const state: PopoverApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isOpen.value },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        'aria-haspopup': 'dialog' as const,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => actions.toggle(),
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'dialog' as const,
        'aria-labelledby': triggerId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: PopoverApi['bindings'] = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    return { state, actions, bindings, triggerRef, contentRef }
}