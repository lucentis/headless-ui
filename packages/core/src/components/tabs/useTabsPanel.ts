import { computed } from 'vue'
import { useTabsContext } from './TabsContext'
import type { UseTabsPanelProps, TabsPanelApi, TabsApi } from './types'

export function useTabsPanel(props: UseTabsPanelProps, tabs?: TabsApi): TabsPanelApi {
    const tabsApi = tabs ?? useTabsContext()

    const isSelected = computed(() => tabsApi.actions.isSelected(props.value))

    // panel id is derived from value — must match what useTabsTrigger generates for aria-controls
    const panelId = `tabs-panel-${props.value}`
    const triggerId = tabsApi.state.listId

    const state: TabsPanelApi['state'] = {
        get isSelected() { return isSelected.value },
    }

    const panelBindings = computed(() => ({
        id: panelId,
        role: 'tabpanel' as const,
        'aria-labelledby': triggerId,
        'data-state': isSelected.value ? ('active' as const) : ('inactive' as const),
        'data-orientation': tabsApi.state.orientation,
        tabindex: 0 as const,
    }))

    const bindings: TabsPanelApi['bindings'] = {
        get panel() { return panelBindings.value },
    }

    return { state, actions: {}, bindings }
}