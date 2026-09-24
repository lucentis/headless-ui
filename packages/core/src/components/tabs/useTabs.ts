import { computed, toValue, watch, reactive} from 'vue'
import { useId } from '../../utils/useId'
import { useControllableState } from '../../utils/useControllableState'
import { useDisabled } from '../../utils/useDisabled'
import { useRegistry } from '../../utils/useRegistry'
import { useHighlight } from '../../utils/useHighlight'
import { useArrowNavigation } from '../../utils/useArrowNavigation'
import type { UseTabsProps, TabsApi, TabsRegistryItem, TabsInternals, TabsState, TabsActions, TabsBindings } from './types'
import { TabsInternalKey } from '../../keys/internal-keys'

export function useTabs(props: UseTabsProps = {}): TabsApi {
    const { value, setValue } = useControllableState({
        value: props.value,
        defaultValue: props.defaultValue ?? '',
        onChange: props.onValueChange,
    })

    const orientation = computed(() => toValue(props.orientation) ?? 'horizontal')
    const activation = computed(() => toValue(props.activation) ?? 'automatic')
    const isDisabled = useDisabled(props.disabled)
    const listId = useId('tabs-list')

    const { registry, register, unregister, getItem } = useRegistry<TabsRegistryItem>()
    const { highlightValue, highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted } = useHighlight(registry, { loop: true })

    highlightValue.value = value.value || ''

    watch(highlightValue, (newHighlight) => {
        if (newHighlight === null) return

        const item = getItem(newHighlight)

        if (item?.triggerRef) {
            item.triggerRef.value?.focus()
        }

        if (activation.value === 'automatic') {
            actions.select(newHighlight)
        }
    }, { flush: 'post' })

    const state = reactive<TabsState>({
        get value() { return value.value },
        get highlightValue() { return highlightValue.value! },
        get orientation() { return orientation.value },
        get activation() { return activation.value },
        get isDisabled() { return isDisabled.value },
        get listId() { return listId },
    })

    const actions: TabsActions = {
        highlight, highlightFirst, highlightLast, highlightNext, highlightPrev, isHighlighted,

        select(tabValue: string): void {
            if (isDisabled.value) return
            setValue(tabValue)
        },

        isSelected(tabValue: string): boolean {
            return value.value === tabValue
        },
    }

    const { onKeydown: onArrowKeydown } = useArrowNavigation({
        orientation,
        onNext: actions.highlightNext,
        onPrev: actions.highlightPrev,
        onFirst: actions.highlightFirst,
        onLast: actions.highlightLast,
    })

    const listBindings = computed(() => ({
        //other binding?
        'aria-orientation': orientation.value,
        role: 'tablist' as const,
        onKeydown: (event: KeyboardEvent) => {
            onArrowKeydown(event)
        },
    }))

    const bindings: TabsBindings = {
        get list() { return listBindings.value },
    }

    const internals: TabsInternals = {
        linkTrigger: register,
        unlinkTrigger: unregister,
        getTriggerId: (tabValue: string) => getItem(tabValue)?.triggerId ?? '',
        getPanelId: (tabValue: string) => getItem(tabValue)?.panelId ?? '',
    }

    return {
        state,
        actions,
        bindings,
        [TabsInternalKey]: internals,
    }
}