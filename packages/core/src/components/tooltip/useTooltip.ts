import { computed, onUnmounted, reactive, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useOpenState } from '../../utils/useOpenState'
import { useDisabled } from '../../utils/useDisabled'
import { useEscape } from '../../utils/useEscape'
import { useConfig } from '../../config'
import type { UseTooltipProps, TooltipApi, TooltipState, TooltipActions, TooltipBindings } from './types'

const DEFAULT_DELAY = 700
const CLOSE_DELAY = 100

export function useTooltip(props: UseTooltipProps = {}): TooltipApi {
    const config = useConfig()
    const isDisabled = useDisabled(props.disabled)

    const {
        isOpen,
        isPresent,
        open: openState,
        close: closeState,
    } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
        animationDuration: config.animationDuration,
    })

    const contentId = useId('tooltip-content')

    let openTimer: ReturnType<typeof setTimeout> | null = null
    let closeTimer: ReturnType<typeof setTimeout> | null = null

    function clearTimers() {
        if (openTimer) clearTimeout(openTimer)
        if (closeTimer) clearTimeout(closeTimer)
        openTimer = null
        closeTimer = null
    }

    function openWithDelay() {
        if (isDisabled.value) return
        clearTimers()

        const delay = toValue(props.delayDuration) ?? DEFAULT_DELAY
        if (delay === 0) {
            actions.open()
            return
        }

        openTimer = setTimeout(actions.open, delay)
    }

    function closeWithDelay() {
        clearTimers()
        closeTimer = setTimeout(actions.close, CLOSE_DELAY)
    }

    const state: TooltipState = reactive({
        isOpen,
        isPresent,
        isDisabled,
    })

    const actions: TooltipActions = {
        open() {
            if (isDisabled.value) return
            clearTimers()
            openState()
        },
        close() {
            clearTimers()
            closeState()
        },
    }

    useEscape({
        active: isOpen,
        onEscape: actions.close,
    })

    onUnmounted(clearTimers)

    const triggerBindings = computed(() => ({
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        'aria-describedby': contentId,
        onPointerenter: openWithDelay,
        onPointerleave: closeWithDelay,
        onFocus: openWithDelay,
        onBlur: closeWithDelay,
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'tooltip' as const,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: TooltipBindings = {
        get trigger() {
            return triggerBindings.value
        },
        get content() {
            return contentBindings.value
        },
    }

    return { state, actions, bindings }
}
