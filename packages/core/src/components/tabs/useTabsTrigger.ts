import { computed, onMounted, onUnmounted } from 'vue'
import { useId } from '../../utils/useId'
import { useDisabled } from '../../utils/useDisabled'
import { useTabsContext } from './TabsContext'
import { Keys } from '../../utils/keys'
import type { UseTabsTriggerProps, TabsTriggerApi, TabsApi } from './types'

export function useTabsTrigger(props: UseTabsTriggerProps, tabs?: TabsApi): TabsTriggerApi {
    const tabsApi = tabs ?? useTabsContext()

    const ownDisabled = useDisabled(props.disabled)
    const isDisabled = computed(() => tabsApi.state.isDisabled || ownDisabled.value)
    const isSelected = computed(() => tabsApi.actions.isSelected(props.value))
    const isFocused = computed(() => tabsApi.actions.isFocused(props.value))

    // trigger owns both IDs — single source of truth
    const triggerId = useId('tabs-trigger')
    const panelId = useId('tabs-panel')

    onMounted(() => tabsApi.linkTrigger({ value: props.value, triggerId, panelId }))
    onUnmounted(() => tabsApi.unlinkTrigger(props.value))

    const state: TabsTriggerApi['state'] = {
        get isSelected() { return isSelected.value },
        get isFocused() { return isFocused.value },
        get isDisabled() { return isDisabled.value },
    }

    const actions: TabsTriggerApi['actions'] = {
        select: () => tabsApi.actions.select(props.value),
        focus: () => tabsApi.actions.focus(props.value),
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        role: 'tab' as const,
        'aria-selected': isSelected.value,
        'aria-controls': tabsApi.getPanelId(props.value),
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isSelected.value ? ('active' as const) : ('inactive' as const),
        'data-orientation': tabsApi.state.orientation,
        tabindex: isSelected.value ? (0 as const) : (-1 as const),
        onClick: () => {
            if (!isDisabled.value) actions.select()
        },
        onFocus: () => {
            tabsApi.actions.focus(props.value)
        },
        onKeydown: (event: KeyboardEvent) => {
            const orientation = tabsApi.state.orientation
            const prev = orientation === 'horizontal' ? Keys.ArrowLeft : Keys.ArrowUp
            const next = orientation === 'horizontal' ? Keys.ArrowRight : Keys.ArrowDown

            if (event.key === prev || event.key === next || event.key === Keys.Home || event.key === Keys.End) {
                event.preventDefault()
            }

            if (event.key === Keys.Enter || event.key === Keys.Space) {
                if (!isDisabled.value) actions.select()
            }
        },
    }))

    const bindings: TabsTriggerApi['bindings'] = {
        get trigger() { return triggerBindings.value },
    }

    return { state, actions, bindings }
}