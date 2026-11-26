import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useCollapsible } from './useCollapsible'
import { useCollapsibleTrigger } from './useCollapsibleTrigger'
import { provideCollapsibleContext } from './CollapsibleContext'

function createHost(
    collapsibleProps: Parameters<typeof useCollapsible>[0] = {},
    triggerProps: Parameters<typeof useCollapsibleTrigger>[0] = {},
) {
    let exposedCollapsible: ReturnType<typeof useCollapsible>
    let exposedTrigger: ReturnType<typeof useCollapsibleTrigger>

    const Child = defineComponent({
        setup() {
            exposedTrigger = useCollapsibleTrigger(triggerProps)
        },
        template: '<div />',
    })

    const Parent = defineComponent({
        components: { Child },
        setup() {
            exposedCollapsible = useCollapsible(collapsibleProps)
            provideCollapsibleContext(exposedCollapsible)
        },
        template: '<Child />',
    })

    mount(Parent)
    return {
        get collapsible() {
            return exposedCollapsible
        },
        get state() {
            return exposedTrigger.state
        },
        get bindings() {
            return exposedTrigger.bindings
        },
    }
}

function createClick() {
    return new MouseEvent('click', { cancelable: true })
}

describe('useCollapsibleTrigger', () => {
    describe('state', () => {
        it('shares the collapsible state', async () => {
            const { state, collapsible } = createHost()
            expect(state.isOpen).toBe(false)
            collapsible.actions.open()
            await nextTick()
            expect(state.isOpen).toBe(true)
        })
    })

    describe('bindings.root', () => {
        it('exposes the trigger bindings of the collapsible', () => {
            const { bindings, collapsible } = createHost()
            expect(bindings.root.id).toBe(collapsible.bindings.trigger.id)
            expect(bindings.root['aria-controls']).toBe(collapsible.bindings.content.id)
        })

        it('aria-expanded reflects isOpen', async () => {
            const { bindings, collapsible } = createHost()
            expect(bindings.root['aria-expanded']).toBe(false)
            collapsible.actions.open()
            await nextTick()
            expect(bindings.root['aria-expanded']).toBe(true)
        })

        it('onClick toggles the collapsible', async () => {
            const { state, bindings } = createHost()
            bindings.root.onClick(createClick())
            await nextTick()
            expect(state.isOpen).toBe(true)
            bindings.root.onClick(createClick())
            await nextTick()
            expect(state.isOpen).toBe(false)
        })

        it('onClick does nothing when disabled', async () => {
            const { state, bindings } = createHost({ disabled: true })
            bindings.root.onClick(createClick())
            await nextTick()
            expect(state.isOpen).toBe(false)
        })
    })

    describe('onClick prop', () => {
        it('runs the user handler before the toggle', async () => {
            const openStates: boolean[] = []
            const { state, bindings } = createHost({}, { onClick: () => openStates.push(state.isOpen) })
            bindings.root.onClick(createClick())
            await nextTick()
            expect(openStates).toEqual([false])
            expect(state.isOpen).toBe(true)
        })

        it('does not toggle when the user handler calls preventDefault', async () => {
            const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
            const { state, bindings } = createHost({}, { onClick })
            bindings.root.onClick(createClick())
            await nextTick()
            expect(onClick).toHaveBeenCalledTimes(1)
            expect(state.isOpen).toBe(false)
        })

        it('still runs the user handler when disabled', async () => {
            const onClick = vi.fn()
            const { state, bindings } = createHost({ disabled: true }, { onClick })
            bindings.root.onClick(createClick())
            await nextTick()
            expect(onClick).toHaveBeenCalledTimes(1)
            expect(state.isOpen).toBe(false)
        })
    })

    describe('without context', () => {
        it('works in the same setup when the collapsible is passed', async () => {
            const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
            let exposedCollapsible: ReturnType<typeof useCollapsible>
            let exposedTrigger: ReturnType<typeof useCollapsibleTrigger>

            const Host = defineComponent({
                setup() {
                    exposedCollapsible = useCollapsible()
                    exposedTrigger = useCollapsibleTrigger({ onClick }, exposedCollapsible)
                },
                template: '<div />',
            })

            mount(Host)

            exposedTrigger!.bindings.root.onClick(createClick())
            await nextTick()
            expect(onClick).toHaveBeenCalledTimes(1)
            expect(exposedCollapsible!.state.isOpen).toBe(false)

            onClick.mockImplementation(() => {})
            exposedTrigger!.bindings.root.onClick(createClick())
            await nextTick()
            expect(exposedCollapsible!.state.isOpen).toBe(true)
        })
    })

    describe('context', () => {
        it('throws outside a Collapsible', () => {
            const Host = defineComponent({
                setup() {
                    useCollapsibleTrigger()
                },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useCollapsibleContext must be used within a Collapsible')
        })
    })
})
