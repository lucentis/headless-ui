import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useTabs } from './useTabs'
import { useTabsTrigger } from './useTabsTrigger'
import { useTabsPanel } from './useTabsPanel'
import { provideTabsContext, useTabsContext } from './TabsContext'

function createTabsHost(props: Parameters<typeof useTabs>[0] = {}) {
    let exposed: ReturnType<typeof useTabs>

    const Host = defineComponent({
        setup() { exposed = useTabs(props) },
        template: '<div />',
    })

    mount(Host)
    return {
        get state() { return exposed.state },
        get actions() { return exposed.actions },
        get api() { return exposed },
    }
}

function createTriggerHost(
    tabsProps: Parameters<typeof useTabs>[0] = {},
    triggerProps: Parameters<typeof useTabsTrigger>[0],
) {
    let exposedTabs: ReturnType<typeof useTabs>
    let exposedTrigger: ReturnType<typeof useTabsTrigger>

    const Host = defineComponent({
        setup() {
            exposedTabs = useTabs(tabsProps)
            exposedTrigger = useTabsTrigger(triggerProps, exposedTabs)
        },
        template: '<div />',
    })

    mount(Host)
    return {
        get tabs() { return exposedTabs },
        get state() { return exposedTrigger.state },
        get actions() { return exposedTrigger.actions },
        get bindings() { return exposedTrigger.bindings },
    }
}

function createPanelHost(
    tabsProps: Parameters<typeof useTabs>[0] = {},
    panelProps: Parameters<typeof useTabsPanel>[0],
) {
    let exposedTabs: ReturnType<typeof useTabs>
    let exposedPanel: ReturnType<typeof useTabsPanel>

    const Host = defineComponent({
        setup() {
            exposedTabs = useTabs(tabsProps)
            exposedPanel = useTabsPanel(panelProps, exposedTabs)
        },
        template: '<div />',
    })

    mount(Host)
    return {
        get tabs() { return exposedTabs },
        get state() { return exposedPanel.state },
        get bindings() { return exposedPanel.bindings },
    }
}

describe('useTabs', () => {
    describe('state', () => {
        it('value defaults to empty string', () => {
            const { state } = createTabsHost()
            expect(state.value).toBe('')
        })

        it('value respects defaultValue', () => {
            const { state } = createTabsHost({ defaultValue: 'tab-1' })
            expect(state.value).toBe('tab-1')
        })

        it('orientation defaults to horizontal', () => {
            const { state } = createTabsHost()
            expect(state.orientation).toBe('horizontal')
        })

        it('activation defaults to automatic', () => {
            const { state } = createTabsHost()
            expect(state.activation).toBe('automatic')
        })

        it('isDisabled defaults to false', () => {
            const { state } = createTabsHost()
            expect(state.isDisabled).toBe(false)
        })

        it('reflects controlled value', async () => {
            const value = ref('tab-1')
            const { state } = createTabsHost({ value })
            expect(state.value).toBe('tab-1')
            value.value = 'tab-2'
            await nextTick()
            expect(state.value).toBe('tab-2')
        })
    })

    describe('actions', () => {
        it('select updates value', async () => {
            const { state, actions } = createTabsHost()
            actions.select('tab-1')
            await nextTick()
            expect(state.value).toBe('tab-1')
        })

        it('select does nothing when disabled', async () => {
            const { state, actions } = createTabsHost({ disabled: true })
            actions.select('tab-1')
            await nextTick()
            expect(state.value).toBe('')
        })

        it('select calls onValueChange', () => {
            const onValueChange = vi.fn()
            const { actions } = createTabsHost({ onValueChange })
            actions.select('tab-1')
            expect(onValueChange).toHaveBeenCalledWith('tab-1')
        })

        it('isSelected returns true for selected tab', () => {
            const { actions } = createTabsHost({ defaultValue: 'tab-1' })
            expect(actions.isSelected('tab-1')).toBe(true)
        })

        it('isSelected returns false for unselected tab', () => {
            const { actions } = createTabsHost({ defaultValue: 'tab-1' })
            expect(actions.isSelected('tab-2')).toBe(false)
        })

        it('focus updates focusedValue', async () => {
            const { state, actions } = createTabsHost()
            actions.focus('tab-1')
            await nextTick()
            expect(state.focusedValue).toBe('tab-1')
        })

        it('focus also selects in automatic mode', async () => {
            const { state, actions } = createTabsHost({ activation: 'automatic' })
            actions.focus('tab-1')
            await nextTick()
            expect(state.value).toBe('tab-1')
        })

        it('focus does not select in manual mode', async () => {
            const { state, actions } = createTabsHost({ activation: 'manual' })
            actions.focus('tab-1')
            await nextTick()
            expect(state.value).toBe('')
        })

        it('does not mutate state in controlled mode', async () => {
            const value = ref('tab-1')
            const { actions } = createTabsHost({ value })
            actions.select('tab-2')
            await nextTick()
            expect(actions.isSelected('tab-1')).toBe(true)
        })
    })
})

describe('useTabsTrigger', () => {
    describe('state', () => {
        it('isSelected reflects tabs state', async () => {
            const { state, tabs } = createTriggerHost({}, { value: 'tab-1' })
            expect(state.isSelected).toBe(false)
            tabs.actions.select('tab-1')
            await nextTick()
            expect(state.isSelected).toBe(true)
        })

        it('isDisabled is true when tabs is disabled', () => {
            const { state } = createTriggerHost({ disabled: true }, { value: 'tab-1' })
            expect(state.isDisabled).toBe(true)
        })

        it('isDisabled is true when trigger is disabled', () => {
            const { state } = createTriggerHost({}, { value: 'tab-1', disabled: true })
            expect(state.isDisabled).toBe(true)
        })
    })

    describe('bindings.trigger', () => {
        it('role is tab', () => {
            const { bindings } = createTriggerHost({}, { value: 'tab-1' })
            expect(bindings.trigger.role).toBe('tab')
        })

        it('aria-selected reflects isSelected', async () => {
            const { bindings, tabs } = createTriggerHost({}, { value: 'tab-1' })
            expect(bindings.trigger['aria-selected']).toBe(false)
            tabs.actions.select('tab-1')
            await nextTick()
            expect(bindings.trigger['aria-selected']).toBe(true)
        })

        it('tabindex is 0 when selected', () => {
            const { bindings } = createTriggerHost({ defaultValue: 'tab-1' }, { value: 'tab-1' })
            expect(bindings.trigger.tabindex).toBe(0)
        })

        it('tabindex is -1 when not selected', () => {
            const { bindings } = createTriggerHost({}, { value: 'tab-1' })
            expect(bindings.trigger.tabindex).toBe(-1)
        })

        it('data-state is active when selected', () => {
            const { bindings } = createTriggerHost({ defaultValue: 'tab-1' }, { value: 'tab-1' })
            expect(bindings.trigger['data-state']).toBe('active')
        })

        it('data-state is inactive when not selected', () => {
            const { bindings } = createTriggerHost({}, { value: 'tab-1' })
            expect(bindings.trigger['data-state']).toBe('inactive')
        })

        it('onClick selects the tab', async () => {
            const { state, bindings } = createTriggerHost({}, { value: 'tab-1' })
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isSelected).toBe(true)
        })

        it('onClick does nothing when disabled', async () => {
            const { state, bindings } = createTriggerHost({}, { value: 'tab-1', disabled: true })
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isSelected).toBe(false)
        })

        it('data-orientation reflects tabs orientation', () => {
            const { bindings } = createTriggerHost({ orientation: 'vertical' }, { value: 'tab-1' })
            expect(bindings.trigger['data-orientation']).toBe('vertical')
        })
    })
})

describe('useTabsPanel', () => {
    describe('state', () => {
        it('isSelected reflects tabs state', async () => {
            const { state, tabs } = createPanelHost({}, { value: 'tab-1' })
            expect(state.isSelected).toBe(false)
            tabs.actions.select('tab-1')
            await nextTick()
            expect(state.isSelected).toBe(true)
        })
    })

    describe('bindings.panel', () => {
        it('role is tabpanel', () => {
            const { bindings } = createPanelHost({}, { value: 'tab-1' })
            expect(bindings.panel.role).toBe('tabpanel')
        })

        it('tabindex is 0', () => {
            const { bindings } = createPanelHost({}, { value: 'tab-1' })
            expect(bindings.panel.tabindex).toBe(0)
        })

        it('data-state is active when selected', () => {
            const { bindings } = createPanelHost({ defaultValue: 'tab-1' }, { value: 'tab-1' })
            expect(bindings.panel['data-state']).toBe('active')
        })

        it('data-state is inactive when not selected', () => {
            const { bindings } = createPanelHost({}, { value: 'tab-1' })
            expect(bindings.panel['data-state']).toBe('inactive')
        })

        it('data-orientation reflects tabs orientation', () => {
            const { bindings } = createPanelHost({ orientation: 'vertical' }, { value: 'tab-1' })
            expect(bindings.panel['data-orientation']).toBe('vertical')
        })
    })

    describe('context', () => {
        it('useTabsContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useTabsContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useTabsContext must be used within a Tabs')
        })

        it('useTabsContext returns api inside provider', () => {
            let innerApi: ReturnType<typeof useTabsContext> | undefined

            const Child = defineComponent({
                setup() { innerApi = useTabsContext() },
                template: '<div />',
            })

            const Parent = defineComponent({
                components: { Child },
                setup() {
                    const api = useTabs()
                    provideTabsContext(api)
                },
                template: '<Child />',
            })

            mount(Parent)
            expect(innerApi).toBeDefined()
            expect(typeof innerApi!.state.value).toBe('string')
        })
    })
})