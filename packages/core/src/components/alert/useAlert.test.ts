import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useAlert } from './useAlert'

function createHost(props: Parameters<typeof useAlert>[0] = {}) {
    let exposed: ReturnType<typeof useAlert>

    const Host = defineComponent({
        setup() {
            exposed = useAlert(props)
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

describe('useAlert', () => {
    describe('state', () => {
        it('isOpen defaults to true', () => {
            const { state } = createHost()
            expect(state.isOpen).toBe(true)
        })

        it('isOpen respects defaultOpen', () => {
            const { state } = createHost({ defaultOpen: false })
            expect(state.isOpen).toBe(false)
        })

        it('isPresent mirrors isOpen', () => {
            const { state } = createHost()
            expect(state.isPresent).toBe(state.isOpen)
        })

        it('reflects controlled open prop', () => {
            const { state } = createHost({ open: false })
            expect(state.isOpen).toBe(false)
        })

        it('reacts when controlled open ref changes', async () => {
            const open = ref(true)
            const { state } = createHost({ open })

            expect(state.isOpen).toBe(true)
            open.value = false
            await nextTick()
            expect(state.isOpen).toBe(false)
        })
    })

    describe('actions', () => {
        it('open sets isOpen to true', async () => {
            const { state, actions } = createHost({ defaultOpen: false })
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

        it('calls onOpenChange when opening', () => {
            const onOpenChange = vi.fn()
            const { actions } = createHost({ defaultOpen: false, onOpenChange })
            actions.open()
            expect(onOpenChange).toHaveBeenCalledWith(true)
        })

        it('calls onOpenChange when closing', () => {
            const onOpenChange = vi.fn()
            const { actions } = createHost({ defaultOpen: true, onOpenChange })
            actions.close()
            expect(onOpenChange).toHaveBeenCalledWith(false)
        })

        it('does not mutate internal state in controlled mode', async () => {
            const open = ref(true)
            const { state, actions } = createHost({ open })
            actions.close()
            await nextTick()
            expect(state.isOpen).toBe(true)
        })
    })

    describe('bindings.root', () => {
        it('role defaults to status', () => {
            const { bindings } = createHost()
            expect(bindings.root.role).toBe('status')
        })

        it('role reflects prop', () => {
            const { bindings } = createHost({ role: 'alert' })
            expect(bindings.root.role).toBe('alert')
        })

        it('aria-live is polite when role is status', () => {
            const { bindings } = createHost({ role: 'status' })
            expect(bindings.root['aria-live']).toBe('polite')
        })

        it('aria-live is assertive when role is alert', () => {
            const { bindings } = createHost({ role: 'alert' })
            expect(bindings.root['aria-live']).toBe('assertive')
        })

        it('aria-atomic is always true', () => {
            const { bindings } = createHost()
            expect(bindings.root['aria-atomic']).toBe(true)
        })

        it('data-state is open by default', () => {
            const { bindings } = createHost()
            expect(bindings.root['data-state']).toBe('open')
        })

        it('data-state is closed when defaultOpen is false', () => {
            const { bindings } = createHost({ defaultOpen: false })
            expect(bindings.root['data-state']).toBe('closed')
        })

        it('data-state reacts when actions are called', async () => {
            const { bindings, actions } = createHost({ defaultOpen: true })
            actions.close()
            await nextTick()
            expect(bindings.root['data-state']).toBe('closed')
        })

        it('aria-live reacts when role ref changes', async () => {
            const role = ref<'alert' | 'status'>('status')
            const { bindings } = createHost({ role })

            expect(bindings.root['aria-live']).toBe('polite')
            role.value = 'alert'
            await nextTick()
            expect(bindings.root['aria-live']).toBe('assertive')
        })
    })
})