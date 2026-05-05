import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { usePopover } from './usePopover'
import { providePopoverContext, usePopoverContext } from './PopoverContext'

function createHost(props: Parameters<typeof usePopover>[0] = {}) {
    let exposed: ReturnType<typeof usePopover>

    const Host = defineComponent({
        setup() { exposed = usePopover(props) },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return {
        wrapper,
        get state() { return exposed.state },
        get actions() { return exposed.actions },
        get bindings() { return exposed.bindings },
        get triggerRef() { return exposed.triggerRef },
        get contentRef() { return exposed.contentRef },
    }
}

describe('usePopover', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('state', () => {
        it('isOpen defaults to false', () => {
            const { state, wrapper } = createHost()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('isPresent mirrors isOpen', () => {
            const { state, wrapper } = createHost()
            expect(state.isPresent).toBe(state.isOpen)
            wrapper.unmount()
        })

        it('triggerId and contentId are stable strings', () => {
            const { state, wrapper } = createHost()
            expect(typeof state.triggerId).toBe('string')
            expect(typeof state.contentId).toBe('string')
            expect(state.triggerId).not.toBe(state.contentId)
            wrapper.unmount()
        })

        it('reflects controlled open ref', async () => {
            const open = ref(false)
            const { state, wrapper } = createHost({ open })
            open.value = true
            await nextTick()
            expect(state.isOpen).toBe(true)
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
            const { state, actions, wrapper } = createHost({ defaultOpen: true })
            actions.close()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('toggle flips isOpen', async () => {
            const { state, actions, wrapper } = createHost()
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(true)
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('calls onOpenChange', () => {
            const onOpenChange = vi.fn()
            const { actions, wrapper } = createHost({ onOpenChange })
            actions.open()
            expect(onOpenChange).toHaveBeenCalledWith(true)
            wrapper.unmount()
        })

        it('does not mutate state in controlled mode', async () => {
            const open = ref(false)
            const { state, actions, wrapper } = createHost({ open })
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('bindings.trigger', () => {
        it('aria-haspopup is dialog', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.trigger['aria-haspopup']).toBe('dialog')
            wrapper.unmount()
        })

        it('aria-expanded reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createHost()
            expect(bindings.trigger['aria-expanded']).toBe(false)
            actions.open()
            await nextTick()
            expect(bindings.trigger['aria-expanded']).toBe(true)
            wrapper.unmount()
        })

        it('aria-controls matches contentId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.trigger['aria-controls']).toBe(state.contentId)
            wrapper.unmount()
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createHost()
            expect(bindings.trigger['data-state']).toBe('closed')
            actions.open()
            await nextTick()
            expect(bindings.trigger['data-state']).toBe('open')
            wrapper.unmount()
        })

        it('onClick toggles popover', async () => {
            const { state, bindings, wrapper } = createHost()
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })
    })

    describe('bindings.content', () => {
        it('role is dialog', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.content.role).toBe('dialog')
            wrapper.unmount()
        })

        it('aria-labelledby matches triggerId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.content['aria-labelledby']).toBe(state.triggerId)
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
    })

    describe('escape', () => {
        it('closes on Escape key', async () => {
            const { state, actions, wrapper } = createHost()
            actions.open()
            await nextTick()
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('outside click', () => {
        it('closes when clicking outside trigger and content', async () => {
            const { state, actions, triggerRef, contentRef, wrapper } = createHost()

            const triggerEl = document.createElement('button')
            const contentEl = document.createElement('div')
            document.body.appendChild(triggerEl)
            document.body.appendChild(contentEl)
            triggerRef.value = triggerEl
            contentRef.value = contentEl

            actions.open()
            await nextTick()

            const outside = document.createElement('div')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
            await nextTick()

            expect(state.isOpen).toBe(false)
            wrapper.unmount()
            triggerEl.remove()
            contentEl.remove()
            outside.remove()
        })

        it('does not close when clicking trigger', async () => {
            const { state, actions, triggerRef, wrapper } = createHost()

            const triggerEl = document.createElement('button')
            document.body.appendChild(triggerEl)
            triggerRef.value = triggerEl

            actions.open()
            await nextTick()

            triggerEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
            await nextTick()

            expect(state.isOpen).toBe(true)
            wrapper.unmount()
            triggerEl.remove()
        })
    })

    describe('context', () => {
        it('usePopoverContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { usePopoverContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] usePopoverContext must be used within a Popover')
        })

        it('usePopoverContext returns api inside provider', () => {
            let innerApi: ReturnType<typeof usePopoverContext> | undefined

            const Child = defineComponent({
                setup() { innerApi = usePopoverContext() },
                template: '<div />',
            })

            const Parent = defineComponent({
                components: { Child },
                setup() {
                    const api = usePopover()
                    providePopoverContext(api)
                },
                template: '<Child />',
            })

            mount(Parent, { attachTo: document.body })
            expect(innerApi).toBeDefined()
            expect(typeof innerApi!.state.isOpen).toBe('boolean')
        })
    })
})