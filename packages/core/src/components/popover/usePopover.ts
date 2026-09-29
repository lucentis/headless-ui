import { computed, ref, reactive } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useDismiss } from '../../utils/useDismiss'
import { useConfig } from '../../config'
import type { UsePopoverProps, PopoverApi, PopoverState, PopoverActions, PopoverBindings } from './types'

export function usePopover(props: UsePopoverProps = {}): PopoverApi {
    const config = useConfig()

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
        animationDuration: config.animationDuration
    })

    const triggerId = useId('popover-trigger')
    const contentId = useId('popover-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    useDismiss({
        active: isOpen,
        targets: [triggerRef, contentRef],
        onDismiss: close,
        escape: config.closeOnEscape,
        outsideClick: config.closeOnOutsideClick,
    })

    const state: PopoverState = reactive({
        isOpen,
        isPresent,
        triggerId,
        contentId,
    })

    const actions: PopoverActions = { open, close, toggle }

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

    const bindings: PopoverBindings = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    return { state, actions, bindings, triggerRef, contentRef }
}