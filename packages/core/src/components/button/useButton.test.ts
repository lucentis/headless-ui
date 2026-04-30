import { describe, it, expect } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useButton } from './useButton'

function createHost(props: Parameters<typeof useButton>[0] = {}) {
    let exposed: ReturnType<typeof useButton>

    const Host = defineComponent({
        setup() {
            exposed = useButton(props)
        },
        template: '<div />',
    })

    mount(Host)
    return { get state() { return exposed.state }, get bindings() { return exposed.bindings } }
}

describe('useButton', () => {
    describe('state', () => {
        it('isDisabled is false by default', () => {
            const { state } = createHost()
            expect(state.isDisabled).toBe(false)
        })

        it('isDisabled reflects a static boolean prop', () => {
            const { state } = createHost({ disabled: true })
            expect(state.isDisabled).toBe(true)
        })

        it('isDisabled reacts when a ref changes', async () => {
            const disabled = ref(false)
            const { state } = createHost({ disabled })

            expect(state.isDisabled).toBe(false)
            disabled.value = true
            await nextTick()
            expect(state.isDisabled).toBe(true)
        })
    })

    describe('bindings.button', () => {
        it('disabled is undefined when not disabled', () => {
            const { bindings } = createHost()
            expect(bindings.button.disabled).toBeUndefined()
        })

        it('disabled is true when disabled', () => {
            const { bindings } = createHost({ disabled: true })
            expect(bindings.button.disabled).toBe(true)
        })

        it('aria-disabled is undefined when not disabled', () => {
            const { bindings } = createHost()
            expect(bindings.button['aria-disabled']).toBeUndefined()
        })

        it('aria-disabled is true when disabled', () => {
            const { bindings } = createHost({ disabled: true })
            expect(bindings.button['aria-disabled']).toBe(true)
        })

        it('data-disabled is undefined when not disabled', () => {
            const { bindings } = createHost()
            expect(bindings.button['data-disabled']).toBeUndefined()
        })

        it('data-disabled is empty string when disabled', () => {
            const { bindings } = createHost({ disabled: true })
            expect(bindings.button['data-disabled']).toBe('')
        })

        it('all disabled attributes react when a ref changes', async () => {
            const disabled = ref(false)
            const { bindings } = createHost({ disabled })

            expect(bindings.button.disabled).toBeUndefined()
            disabled.value = true
            await nextTick()
            expect(bindings.button.disabled).toBe(true)
            expect(bindings.button['aria-disabled']).toBe(true)
            expect(bindings.button['data-disabled']).toBe('')
        })
    })
})