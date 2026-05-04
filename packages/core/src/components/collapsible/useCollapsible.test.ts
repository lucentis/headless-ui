import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useCollapsible } from './useCollapsible'
import { provideCollapsibleContext, useCollapsibleContext } from './CollapsibleContext'

function createHost(props: Parameters<typeof useCollapsible>[0] = {}) {
    let exposed: ReturnType<typeof useCollapsible>

    const Host = defineComponent({
        setup() {
            exposed = useCollapsible(props)
        },
        template: '<div />',
    })

    mount(Host)
    return {
        get state() { return exposed.state },
        get actions() { return exposed.actions },
        get bindings() { return exposed.bindings },
    }
}

describe('useCollapsible', () => {
    describe('state', () => {
        it('isOpen defaults to false', () => {
            const { state } = createHost()
            expect(state.isOpen).toBe(false)
        })

        it('isOpen respects defaultOpen', () => {
            const { state } = createHost({ defaultOpen: true })
            expect(state.isOpen).toBe(true)
        })

        it('isDisabled defaults to false', () => {
            const { state } = createHost()
            expect(state.isDisabled).toBe(false)
        })

        it('isPresent mirrors isOpen', () => {
            const { state } = createHost({ defaultOpen: true })
            expect(state.isPresent).toBe(state.isOpen)
        })

        it('triggerId and contentId are stable strings', () => {
            const { state } = createHost()
            expect(typeof state.triggerId).toBe('string')
            expect(typeof state.contentId).toBe('string')
            expect(state.triggerId).not.toBe(state.contentId)
        })

        it('reflects controlled open ref', async () => {
            const open = ref(false)
            const { state } = createHost({ open })

            expect(state.isOpen).toBe(false)
            open.value = true
            await nextTick()
            expect(state.isOpen).toBe(true)
        })

        it('reacts when disabled ref changes', async () => {
            const disabled = ref(false)
            const { state } = createHost({ disabled })

            expect(state.isDisabled).toBe(false)
            disabled.value = true
            await nextTick()
            expect(state.isDisabled).toBe(true)
        })
    })

    describe('actions', () => {
        it('open sets isOpen to true', async () => {
            const { state, actions } = createHost()
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(true)
        })

        it('close sets isOpen to false', async () => {
            const { state, actions } = createHost({ defaultOpen: true })
            actions.close()
            await nextTick()
            expect(state.isOpen).toBe(false)
        })

        it('toggle flips isOpen', async () => {
            const { state, actions } = createHost()
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(true)
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(false)
        })

        it('calls onOpenChange on toggle', () => {
            const onOpenChange = vi.fn()
            const { actions } = createHost({ onOpenChange })
            actions.toggle()
            expect(onOpenChange).toHaveBeenCalledWith(true)
        })

        it('does not mutate internal state in controlled mode', async () => {
            const open = ref(false)
            const { state, actions } = createHost({ open })
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(false)
        })
    })

    describe('bindings.trigger', () => {
        it('id matches state.triggerId', () => {
            const { state, bindings } = createHost()
            expect(bindings.trigger.id).toBe(state.triggerId)
        })

        it('aria-controls matches state.contentId', () => {
            const { state, bindings } = createHost()
            expect(bindings.trigger['aria-controls']).toBe(state.contentId)
        })

        it('aria-expanded reflects isOpen', async () => {
            const { bindings, actions } = createHost()
            expect(bindings.trigger['aria-expanded']).toBe(false)
            actions.toggle()
            await nextTick()
            expect(bindings.trigger['aria-expanded']).toBe(true)
        })

        it('aria-disabled is true when disabled', () => {
            const { bindings } = createHost({ disabled: true })
            expect(bindings.trigger['aria-disabled']).toBe(true)
        })

        it('aria-disabled is undefined when not disabled', () => {
            const { bindings } = createHost()
            expect(bindings.trigger['aria-disabled']).toBeUndefined()
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions } = createHost()
            expect(bindings.trigger['data-state']).toBe('closed')
            actions.toggle()
            await nextTick()
            expect(bindings.trigger['data-state']).toBe('open')
        })

        it('onClick toggles when not disabled', async () => {
            const { state, bindings } = createHost()
            bindings.trigger.onClick(new MouseEvent('click'))
            await nextTick()
            expect(state.isOpen).toBe(true)
        })

        it('onClick does nothing when disabled', async () => {
            const { state, bindings } = createHost({ disabled: true })
            bindings.trigger.onClick(new MouseEvent('click'))
            await nextTick()
            expect(state.isOpen).toBe(false)
        })
    })

    describe('bindings.content', () => {
        it('id matches state.contentId', () => {
            const { state, bindings } = createHost()
            expect(bindings.content.id).toBe(state.contentId)
        })

        it('aria-labelledby matches state.triggerId', () => {
            const { state, bindings } = createHost()
            expect(bindings.content['aria-labelledby']).toBe(state.triggerId)
        })

        it('role is region', () => {
            const { bindings } = createHost()
            expect(bindings.content.role).toBe('region')
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions } = createHost()
            expect(bindings.content['data-state']).toBe('closed')
            actions.toggle()
            await nextTick()
            expect(bindings.content['data-state']).toBe('open')
        })
    })

    describe('context', () => {
        it('useCollapsibleContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useCollapsibleContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useCollapsibleContext must be used within a Collapsible')
        })

        it('useCollapsibleContext returns api inside provider', () => {
            let innerApi: ReturnType<typeof useCollapsibleContext> | undefined

            const Child = defineComponent({
                setup() { innerApi = useCollapsibleContext() },
                template: '<div />',
            })

            const Parent = defineComponent({
                components: { Child },
                setup() {
                    const api = useCollapsible()
                    provideCollapsibleContext(api)
                },
                template: '<Child />',
            })

            mount(Parent)
            expect(innerApi).toBeDefined()
            expect(typeof innerApi!.state.isOpen).toBe('boolean')
        })
    })
})