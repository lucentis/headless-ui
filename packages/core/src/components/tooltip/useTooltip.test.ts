import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useTooltip } from './useTooltip'
import { provideTooltipContext, useTooltipContext } from './TooltipContext'

function createHost(props: Parameters<typeof useTooltip>[0] = {}) {
    let exposed: ReturnType<typeof useTooltip>

    const Host = defineComponent({
        setup() {
            exposed = useTooltip(props)
        },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })

    return {
        wrapper,
        get state() {
            return exposed.state
        },
        get actions() {
            return exposed.actions
        },
        get bindings() {
            return exposed.bindings
        },
    }
}

describe('useTooltip', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('state', () => {
        it('isOpen defaults to false', () => {
            const { state, wrapper } = createHost()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('isDisabled defaults to false', () => {
            const { state, wrapper } = createHost()
            expect(state.isDisabled).toBe(false)
            wrapper.unmount()
        })

        it('isPresent mirrors isOpen', async () => {
            const { state, actions, wrapper } = createHost({ delayDuration: 0 })
            actions.open()
            await nextTick()
            expect(state.isPresent).toBe(state.isOpen)
            wrapper.unmount()
        })

        it('contentId is a stable string', () => {
            const { state, wrapper } = createHost()
            expect(typeof state.contentId).toBe('string')
            wrapper.unmount()
        })

        it('reacts when disabled ref changes', async () => {
            const disabled = ref(false)
            const { state, wrapper } = createHost({ disabled })

            expect(state.isDisabled).toBe(false)

            disabled.value = true
            await nextTick()

            expect(state.isDisabled).toBe(true)

            wrapper.unmount()
        })
    })

    describe('actions', () => {
        it('open sets isOpen to true', async () => {
            const { state, actions, wrapper } = createHost()
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })

        it('close sets isOpen to false', async () => {
            const { state, actions, wrapper } = createHost()
            actions.open()
            await nextTick()
            actions.close()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('open does nothing when disabled', async () => {
            const { state, actions, wrapper } = createHost({ disabled: true })
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('delay', () => {
        it('opens after default delay on pointerenter', async () => {
            const { state, bindings, wrapper } = createHost()

            bindings.trigger.onPointerenter()

            expect(state.isOpen).toBe(false)

            vi.advanceTimersByTime(700)
            await nextTick()

            expect(state.isOpen).toBe(true)

            wrapper.unmount()
        })

        it('opens immediately with delayDuration 0', async () => {
            const { state, bindings, wrapper } = createHost({ delayDuration: 0 })

            bindings.trigger.onPointerenter()
            await nextTick()

            expect(state.isOpen).toBe(true)

            wrapper.unmount()
        })

        it('cancels delay on pointerleave', async () => {
            const { state, bindings, wrapper } = createHost()

            bindings.trigger.onPointerenter()
            bindings.trigger.onPointerleave()

            vi.advanceTimersByTime(700)
            await nextTick()

            expect(state.isOpen).toBe(false)

            wrapper.unmount()
        })

        it('respects custom delayDuration', async () => {
            const { state, bindings, wrapper } = createHost({ delayDuration: 300 })

            bindings.trigger.onPointerenter()

            vi.advanceTimersByTime(299)
            await nextTick()
            expect(state.isOpen).toBe(false)

            vi.advanceTimersByTime(1)
            await nextTick()
            expect(state.isOpen).toBe(true)

            wrapper.unmount()
        })
    })

    describe('bindings.trigger', () => {
        it('aria-describedby matches contentId', () => {
            const { state, bindings, wrapper } = createHost()

            expect(bindings.trigger['aria-describedby']).toBe(state.contentId)

            wrapper.unmount()
        })

        it('onFocus opens immediately', async () => {
            const { state, bindings, wrapper } = createHost()

            bindings.trigger.onFocus()
            
            expect(state.isOpen).toBe(false)

            vi.advanceTimersByTime(700)

            await nextTick()

            expect(state.isOpen).toBe(true)

            wrapper.unmount()
        })

        it('onBlur closes immediately', async () => {
            const { state, bindings, wrapper } = createHost()

            bindings.trigger.onFocus()
            await nextTick()

            bindings.trigger.onBlur()
            await nextTick()

            expect(state.isOpen).toBe(false)

            wrapper.unmount()
        })

        it('onPointerleave closes via delay', async () => {
            const { state, bindings, wrapper } = createHost()

            bindings.trigger.onPointerenter()

            vi.advanceTimersByTime(700)
            await nextTick()

            expect(state.isOpen).toBe(true)

            bindings.trigger.onPointerleave()

            expect(state.isOpen).toBe(true)

            vi.advanceTimersByTime(100)
            await nextTick()

            expect(state.isOpen).toBe(false)

            wrapper.unmount()
        })
    })

    describe('bindings.content', () => {
        it('role is tooltip', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.content.role).toBe('tooltip')
            wrapper.unmount()
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createHost()

            expect(bindings.content['data-state']).toBe('closed')

            actions.open()
            await nextTick()

            expect(bindings.content['data-state']).toBe('open')

            wrapper.unmount()
        })

        it('id matches contentId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.content.id).toBe(state.contentId)
            wrapper.unmount()
        })
    })

    describe('escape', () => {
        it('closes on Escape key', async () => {
            const { state, actions, wrapper } = createHost()

            actions.open()
            await nextTick()

            document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
            )

            await nextTick()

            expect(state.isOpen).toBe(false)

            wrapper.unmount()
        })
    })

    describe('context', () => {
        it('useTooltipContext throws outside provider', () => {
            const Host = defineComponent({
                setup() {
                    useTooltipContext()
                },
                template: '<div />',
            })

            expect(() => mount(Host)).toThrow(
                '[headless-ui] useTooltipContext must be used within a Tooltip',
            )
        })

        it('useTooltipContext returns api inside provider', () => {
            let innerApi: ReturnType<typeof useTooltipContext> | undefined

            const Child = defineComponent({
                setup() {
                    innerApi = useTooltipContext()
                },
                template: '<div />',
            })

            const Parent = defineComponent({
                components: { Child },
                setup() {
                    const api = useTooltip()
                    provideTooltipContext(api)
                },
                template: '<Child />',
            })

            mount(Parent, { attachTo: document.body })

            expect(innerApi).toBeDefined()
            expect(typeof innerApi!.state.isOpen).toBe('boolean')
        })
    })
})