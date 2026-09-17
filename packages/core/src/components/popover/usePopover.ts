import { computed, ref, reactive } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useEscape } from '../../utils/useEscape'
import { useOutsideClick } from '../../utils/useOutsideClick'
import { useConfig } from '../../config'
import { UsePopoverProps, PopoverApi, PopoverState, PopoverActions, PopoverBindings } from './types'

export function usePopover(props: UsePopoverProps = {}): PopoverApi {
    const config = useConfig()

    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
    })

    const triggerId = useId('popover-trigger')
    const contentId = useId('popover-content')

    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    
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

    const state = reactive<PopoverState>({
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
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