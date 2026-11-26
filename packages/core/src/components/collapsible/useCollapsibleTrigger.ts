import { computed } from 'vue'
import { composeHandlers } from '../../utils/eventHandler'
import { useCollapsibleContext } from './CollapsibleContext'
import type { UseCollapsibleTriggerProps, CollapsibleTriggerApi, CollapsibleTriggerBindings } from './types'

export function useCollapsibleTrigger(props: UseCollapsibleTriggerProps = {}): CollapsibleTriggerApi {
    const collapsible = useCollapsibleContext()

    const triggerBindings = computed(() => ({
        ...collapsible.bindings.trigger,
        onClick: composeHandlers(props.onClick, () => {
            if (!collapsible.state.isDisabled) {
                collapsible.actions.toggle()
            }
        }),
    }))

    const bindings: CollapsibleTriggerBindings = {
        get root() {
            return triggerBindings.value
        },
    }

    return {
        state: collapsible.state,
        actions: {},
        bindings,
    }
}
