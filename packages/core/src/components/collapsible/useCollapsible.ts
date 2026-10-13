import { computed, reactive } from 'vue'
import { useOpenState } from '../../utils/useOpenState'
import { useDisabled } from '../../utils/useDisabled'
import { useId } from '../../utils/useId'
import { warnDev } from '../../utils/warnDev'
import { useConfig } from '../../config'
import type {
    UseCollapsibleProps,
    CollapsibleApi,
    CollapsibleState,
    CollapsibleActions,
    CollapsibleBindings,
} from './types'

export function useCollapsible(props: UseCollapsibleProps = {}): CollapsibleApi {
    const { isOpen, isPresent, open, close, toggle } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
        animationDuration: useConfig().animationDuration,
    })

    const isDisabled = useDisabled(props.disabled)

    const triggerId = useId('collapsible-trigger')
    const contentId = useId('collapsible-content')

    const state: CollapsibleState = reactive({
        isOpen,
        isPresent,
        isDisabled,
    })

    const actions: CollapsibleActions = {
        open: () => {
            if (isDisabled.value) {
                warnDev('useCollapsible().actions.open()', 'Cannot open the Collapsible because it is disabled.')
                return
            }
            open()
        },
        close: () => {
            if (isDisabled.value) {
                warnDev('useCollapsible().actions.close()', 'Cannot close the Collapsible because it is disabled.')
                return
            }
            close()
        },
        toggle: () => {
            if (isDisabled.value) {
                warnDev('useCollapsible().actions.toggle()', 'Cannot toggle the Collapsible because it is disabled.')
                return
            }
            toggle()
        },
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        'aria-expanded': isOpen.value,
        'aria-controls': contentId,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => {
            if (!isDisabled.value) toggle()
        },
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'region' as const,
        'aria-labelledby': triggerId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: CollapsibleBindings = {
        get trigger() {
            return triggerBindings.value
        },
        get content() {
            return contentBindings.value
        },
    }

    return { state, actions, bindings }
}
