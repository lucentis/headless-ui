import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDialog } from './useDialog'
import { provideDialogContext, useDialogContext } from './DialogContext'

function createHost(props: Parameters<typeof useDialog>[0] = {}) {
    let exposed: ReturnType<typeof useDialog>

    const Host = defineComponent({
        setup() { exposed = useDialog(props) },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return {
        wrapper,
        get state() { return exposed.state },
        get actions() { return exposed.actions },
        get bindings() { return exposed.bindings },
        get contentRef() { return exposed.contentRef },
    }
}

describe('useDialog', () => {
    beforeEach(() => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
    })

    describe('state', () => {
        it('isOpen defaults to false', () => {
            const { state, wrapper } = createHost()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('isOpen respects defaultOpen', () => {
            const { state, wrapper } = createHost({ defaultOpen: true })
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })

        it('isModal defaults to true', () => {
            const { state, wrapper } = createHost()
            expect(state.isModal).toBe(true)
            wrapper.unmount()
        })

        it('isPresent mirrors isOpen', () => {
            const { state, wrapper } = createHost({ defaultOpen: true })
            expect(state.isPresent).toBe(state.isOpen)
            wrapper.unmount()
        })

        it('titleId and descriptionId are stable strings', () => {
            const { state, wrapper } = createHost()
            expect(typeof state.titleId).toBe('string')
            expect(typeof state.descriptionId).toBe('string')
            expect(state.titleId).not.toBe(state.descriptionId)
            wrapper.unmount()
        })

        it('reflects controlled open ref', async () => {
            const open = ref(false)
            const { state, wrapper } = createHost({ open })
            expect(state.isOpen).toBe(false)
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

        it('calls onOpenChange on open', () => {
            const onOpenChange = vi.fn()
            const { actions, wrapper } = createHost({ onOpenChange })
            actions.open()
            expect(onOpenChange).toHaveBeenCalledWith(true)
            wrapper.unmount()
        })

        it('calls onOpenChange on close', () => {
            const onOpenChange = vi.fn()
            const { actions, wrapper } = createHost({ defaultOpen: true, onOpenChange })
            actions.close()
            expect(onOpenChange).toHaveBeenCalledWith(false)
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

    describe('bindings.overlay', () => {
        it('aria-hidden is always true', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.overlay['aria-hidden']).toBe(true)
            wrapper.unmount()
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createHost()
            expect(bindings.overlay['data-state']).toBe('closed')
            actions.open()
            await nextTick()
            expect(bindings.overlay['data-state']).toBe('open')
            wrapper.unmount()
        })

        it('onClick closes the dialog', async () => {
            const { state, bindings, wrapper } = createHost({ defaultOpen: true })
            bindings.overlay.onClick()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('bindings.content', () => {
        it('role is dialog', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.content.role).toBe('dialog')
            wrapper.unmount()
        })

        it('aria-modal is true when modal', () => {
            const { bindings, wrapper } = createHost({ modal: true })
            expect(bindings.content['aria-modal']).toBe(true)
            wrapper.unmount()
        })

        it('aria-modal is undefined when not modal', () => {
            const { bindings, wrapper } = createHost({ modal: false })
            expect(bindings.content['aria-modal']).toBeUndefined()
            wrapper.unmount()
        })

        it('aria-labelledby matches titleId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.content['aria-labelledby']).toBe(state.titleId)
            wrapper.unmount()
        })

        it('aria-describedby matches descriptionId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.content['aria-describedby']).toBe(state.descriptionId)
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

    describe('bindings.title and description', () => {
        it('title id matches state.titleId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.title.id).toBe(state.titleId)
            wrapper.unmount()
        })

        it('description id matches state.descriptionId', () => {
            const { state, bindings, wrapper } = createHost()
            expect(bindings.description.id).toBe(state.descriptionId)
            wrapper.unmount()
        })
    })

    describe('escape key', () => {
        it('closes dialog on Escape', async () => {
            const { state, actions, wrapper } = createHost()
            actions.open()
            await nextTick()
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('scroll lock', () => {
        it('locks scroll when modal dialog opens', async () => {
            const { actions, wrapper } = createHost({ modal: true })
            actions.open()
            await nextTick()
            expect(document.body.style.overflow).toBe('hidden')
            wrapper.unmount()
        })

        it('unlocks scroll when dialog closes', async () => {
            const { actions, wrapper } = createHost({ defaultOpen: true, modal: true })
            actions.close()
            await nextTick()
            expect(document.body.style.overflow).toBe('')
            wrapper.unmount()
        })

        it('does not lock scroll for non-modal dialog', async () => {
            const { actions, wrapper } = createHost({ modal: false })
            actions.open()
            await nextTick()
            expect(document.body.style.overflow).toBe('')
            wrapper.unmount()
        })
    })

    describe('context', () => {
        it('useDialogContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useDialogContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useDialogContext must be used within a Dialog')
        })

        it('useDialogContext returns api inside provider', () => {
            let innerApi: ReturnType<typeof useDialogContext> | undefined

            const Child = defineComponent({
                setup() { innerApi = useDialogContext() },
                template: '<div />',
            })

            const Parent = defineComponent({
                components: { Child },
                setup() {
                    const api = useDialog()
                    provideDialogContext(api)
                },
                template: '<Child />',
            })

            mount(Parent, { attachTo: document.body })
            expect(innerApi).toBeDefined()
            expect(typeof innerApi!.state.isOpen).toBe('boolean')
        })
    })
})