import { computed, reactive } from 'vue'
import { useTabsContext } from './TabsContext'
import { UseTabsPanelProps, TabsPanelApi, TabsApi, TabsPanelState, TabsPanelBindings } from './types'
import { TabsInternalKey } from '../../keys/internal-keys'

export function useTabsPanel(props: UseTabsPanelProps, tabs?: TabsApi): TabsPanelApi {
    const tabsApi = tabs ?? useTabsContext()
    const { getPanelId, getTriggerId } = tabsApi[TabsInternalKey]

    const isSelected = computed(() => tabsApi.actions.isSelected(props.value))

    const state = reactive<TabsPanelState>({
        get isSelected() { return isSelected.value },
    })

    const panelBindings = computed(() => ({
        id: getPanelId(props.value),
        role: 'tabpanel' as const,
        'aria-labelledby': getTriggerId(props.value),
        'data-state': isSelected.value ? ('active' as const) : ('inactive' as const),
        'data-orientation': tabsApi.state.orientation,
        tabindex: 0 as const,
    }))

    const bindings: TabsPanelBindings = {
        get panel() { return panelBindings.value },
    }

    return { state, actions: {}, bindings }
}