import { computed, ref, toValue, onUnmounted } from 'vue'
import { useId } from '../../utils/useId'
import { useEscape } from '../../utils/useEscape'
import type { UseTooltipProps, TooltipApi } from './types'

const DEFAULT_DELAY = 700
const CLOSE_DELAY = 100

export function useTooltip(props: UseTooltipProps = {}): TooltipApi {
    const isDisabled = computed(() => toValue(props.disabled) ?? false)
    const isOpen = ref(false)

    const contentId = useId('tooltip-content')

    let openTimer: ReturnType<typeof setTimeout> | null = null
    let closeTimer: ReturnType<typeof setTimeout> | null = null

    function clearTimers() {
        if (openTimer) clearTimeout(openTimer)
        if (closeTimer) clearTimeout(closeTimer)
        openTimer = null
        closeTimer = null
    }

    const actions: TooltipApi['actions'] = {
        open() {
            if (isDisabled.value) return
            clearTimers()
            isOpen.value = true
        },

        close() {
            clearTimers()
            isOpen.value = false
        },
    }

    function openWithDelay() {
        if (isDisabled.value) return

        clearTimers()

        const delay = props.delayDuration ?? DEFAULT_DELAY

        if (delay === 0) {
            actions.open()
            return
        }

        openTimer = setTimeout(() => {
            actions.open()
        }, delay)
    }

    function closeWithDelay() {
        clearTimers()

        closeTimer = setTimeout(() => {
            actions.close()
        }, CLOSE_DELAY)
    }

    useEscape({
        active: isOpen,
        onEscape: actions.close,
    })

    onUnmounted(clearTimers)

    const state: TooltipApi['state'] = {
        get isOpen() {
            return isOpen.value
        },
        get isPresent() {
            return isOpen.value
        },
        get isDisabled() {
            return isDisabled.value
        },
        get contentId() {
            return contentId
        },
    }

    const triggerBindings = computed(() => ({
        'aria-describedby': contentId,

        onPointerenter: openWithDelay,
        onPointerleave: closeWithDelay,

        onFocus: openWithDelay,
        onBlur: closeWithDelay,
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'tooltip' as const,
        'data-state': isOpen.value ? 'open' : 'closed',
    }))

    return {
        state,
        actions,
        bindings: {
            get trigger() {
                return triggerBindings.value
            },
            get content() {
                return contentBindings.value
            },
        },
    }
}