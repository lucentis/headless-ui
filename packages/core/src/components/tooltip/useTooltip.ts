import { computed, ref, toValue, onUnmounted } from 'vue'
import { useId } from '../../utils/useId'
import { useEscape } from '../../utils/useEscape'
import type { UseTooltipProps, TooltipApi } from './types'

const DEFAULT_DELAY = 700

export function useTooltip(props: UseTooltipProps = {}): TooltipApi {
    const isDisabled = computed(() => toValue(props.disabled) ?? false)
    const isOpen = ref(false)
    const contentId = useId('tooltip-content')

    let delayTimer: ReturnType<typeof setTimeout> | null = null

    function clearTimer(): void {
        if (delayTimer !== null) {
            clearTimeout(delayTimer)
            delayTimer = null
        }
    }

    const actions: TooltipApi['actions'] = {
        open: () => {
            if (isDisabled.value) return
            isOpen.value = true
        },
        close: () => {
            clearTimer()
            isOpen.value = false
        },
    }

    function openWithDelay(): void {
        if (isDisabled.value) return
        const delay = props.delayDuration ?? DEFAULT_DELAY
        if (delay === 0) {
            actions.open()
            return
        }
        delayTimer = setTimeout(actions.open, delay)
    }

    // close on Escape
    useEscape({
        active: isOpen,
        onEscape: actions.close,
    })

    onUnmounted(clearTimer)

    const state: TooltipApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isOpen.value },
        get isDisabled() { return isDisabled.value },
        get contentId() { return contentId },
    }

    const triggerBindings = computed(() => ({
        'aria-describedby': contentId,
        onMouseenter: openWithDelay,
        onMouseleave: actions.close,
        onFocus: actions.open,
        onBlur: actions.close,
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'tooltip' as const,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: TooltipApi['bindings'] = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    return { state, actions, bindings }
}