import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useId } from '../../utils/useId'
import { useDisabled } from '../../utils/useDisabled'
import { useTabsContext } from './TabsContext'
import { Keys } from '../../utils/keys'
import type { UseTabsTriggerProps, TabsTriggerApi, TabsApi } from './types'
import { TabsInternalKey } from '../../keys/internal-keys'

export function useTabsTrigger(props: UseTabsTriggerProps, tabs?: TabsApi): TabsTriggerApi {
    const tabsApi = tabs ?? useTabsContext()
    const { getPanelId, linkTrigger, unlinkTrigger } = tabsApi[TabsInternalKey]

    const ownDisabled = useDisabled(props.disabled)
    const isDisabled = computed(() => tabsApi.state.isDisabled || ownDisabled.value)
    const isSelected = computed(() => tabsApi.actions.isSelected(props.value))
    const isHighlighted = computed(() => tabsApi.actions.isHighlighted(props.value))

    // trigger owns both IDs — single source of truth
    const triggerId = useId('tabs-trigger')
    const panelId = useId('tabs-panel')
    const triggerRef = ref<HTMLElement | null>(null)

    onMounted(() => linkTrigger({ value: props.value, triggerId, panelId, triggerRef, disabled: isDisabled }))
    onUnmounted(() => unlinkTrigger(props.value))

    const state: TabsTriggerApi['state'] = {
        get isSelected() { return isSelected.value },
        get isHighlighted() { return isHighlighted.value },
        get isDisabled() { return isDisabled.value },
    }

    const actions: TabsTriggerApi['actions'] = {
        select: () => {
            tabsApi.actions.select(props.value)
            tabsApi.actions.highlight(props.value)
        },
        // focus: () => tabsApi.actions.focus(props.value),
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        role: 'tab' as const,
        'aria-selected': isSelected.value,
        'aria-controls': getPanelId(props.value),
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isSelected.value ? ('active' as const) : ('inactive' as const),
        'data-highlighted': isHighlighted.value ? ('' as const) : undefined,
        'data-orientation': tabsApi.state.orientation,
        tabindex: isHighlighted.value ? (0 as const) : (-1 as const),
        onClick: () => {
            if (!isDisabled.value) {
                actions.select()
            }
        },
    }))

    const bindings: TabsTriggerApi['bindings'] = {
        get trigger() { return triggerBindings.value },
    }

    return { state, actions, bindings, triggerRef }
}