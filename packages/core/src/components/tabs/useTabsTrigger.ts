import { computed, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useTabsContext } from './TabsContext'
import type { UseTabsTriggerProps, TabsTriggerApi, TabsApi } from './types'

const Keys = {
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    Home: 'Home',
    End: 'End',
    Enter: 'Enter',
    Space: ' ',
} as const

export function useTabsTrigger(props: UseTabsTriggerProps, tabs?: TabsApi): TabsTriggerApi {
    const tabsApi = tabs ?? useTabsContext()

    const isDisabled = computed(() =>
        tabsApi.state.isDisabled || (toValue(props.disabled) ?? false)
    )
    const isSelected = computed(() => tabsApi.actions.isSelected(props.value))
    const isFocused = computed(() => tabsApi.actions.isFocused(props.value))

    const triggerId = useId('tabs-trigger')
    // panel id must match what useTabsPanel generates — panels register their id via the same value key
    const panelId = `tabs-panel-${props.value}`

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
        'aria-controls': panelId,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isSelected.value ? ('active' as const) : ('inactive' as const),
        'data-orientation': tabsApi.state.orientation,
        // roving focus — only selected tab is in tab order
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

            // keyboard navigation is handled at the list level by the consumer
            // we emit focus change so the consumer can move focus to the right trigger
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