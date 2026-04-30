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
    return { get state() { return exposed.state }, get props() { return exposed.props } }
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

    describe('props.button', () => {
        it('disabled is undefined when not disabled', () => {
            const { props } = createHost()
            expect(props.button.disabled).toBeUndefined()
        })

        it('disabled is true when disabled', () => {
            const { props } = createHost({ disabled: true })
            expect(props.button.disabled).toBe(true)
        })

        it('aria-disabled is undefined when not disabled', () => {
            const { props } = createHost()
            expect(props.button['aria-disabled']).toBeUndefined()
        })

        it('aria-disabled is true when disabled', () => {
            const { props } = createHost({ disabled: true })
            expect(props.button['aria-disabled']).toBe(true)
        })

        it('data-disabled is undefined when not disabled', () => {
            const { props } = createHost()
            expect(props.button['data-disabled']).toBeUndefined()
        })

        it('data-disabled is empty string when disabled', () => {
            const { props } = createHost({ disabled: true })
            expect(props.button['data-disabled']).toBe('')
        })

        it('all disabled attributes react when a ref changes', async () => {
            const disabled = ref(false)
            const { props } = createHost({ disabled })

            expect(props.button.disabled).toBeUndefined()
            disabled.value = true
            await nextTick()
            expect(props.button.disabled).toBe(true)
            expect(props.button['aria-disabled']).toBe(true)
            expect(props.button['data-disabled']).toBe('')
        })
    })
})