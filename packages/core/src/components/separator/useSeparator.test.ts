import { describe, it, expect } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useSeparator } from './useSeparator'

function createHost(props: Parameters<typeof useSeparator>[0] = {}) {
    let exposed: ReturnType<typeof useSeparator>

    const Host = defineComponent({
        setup() {
            exposed = useSeparator(props)
        },
        template: '<div />',
    })

    mount(Host)
    return { get state() { return exposed.state }, get bindings() { return exposed.bindings } }
}

describe('useSeparator', () => {
    describe('state', () => {
        it('orientation defaults to horizontal', () => {
            const { state } = createHost()
            expect(state.orientation).toBe('horizontal')
        })

        it('isDecorative defaults to false', () => {
            const { state } = createHost()
            expect(state.isDecorative).toBe(false)
        })

        it('reflects static orientation prop', () => {
            const { state } = createHost({ orientation: 'vertical' })
            expect(state.orientation).toBe('vertical')
        })

        it('reflects static decorative prop', () => {
            const { state } = createHost({ decorative: true })
            expect(state.isDecorative).toBe(true)
        })

        it('reacts when orientation ref changes', async () => {
            const orientation = ref<'horizontal' | 'vertical'>('horizontal')
            const { state } = createHost({ orientation })

            expect(state.orientation).toBe('horizontal')
            orientation.value = 'vertical'
            await nextTick()
            expect(state.orientation).toBe('vertical')
        })

        it('reacts when decorative ref changes', async () => {
            const decorative = ref(false)
            const { state } = createHost({ decorative })

            expect(state.isDecorative).toBe(false)
            decorative.value = true
            await nextTick()
            expect(state.isDecorative).toBe(true)
        })
    })

    describe('bindings.root', () => {
        it('role is separator by default', () => {
            const { bindings } = createHost()
            expect(bindings.root.role).toBe('separator')
        })

        it('role is none when decorative', () => {
            const { bindings } = createHost({ decorative: true })
            expect(bindings.root.role).toBe('none')
        })

        it('aria-orientation is undefined when horizontal', () => {
            const { bindings } = createHost({ orientation: 'horizontal' })
            expect(bindings.root['aria-orientation']).toBeUndefined()
        })

        it('aria-orientation is vertical when vertical', () => {
            const { bindings } = createHost({ orientation: 'vertical' })
            expect(bindings.root['aria-orientation']).toBe('vertical')
        })

        it('aria-orientation is undefined when decorative even if vertical', () => {
            const { bindings } = createHost({ orientation: 'vertical', decorative: true })
            expect(bindings.root['aria-orientation']).toBeUndefined()
        })

        it('data-orientation is horizontal by default', () => {
            const { bindings } = createHost()
            expect(bindings.root['data-orientation']).toBe('horizontal')
        })

        it('data-orientation reflects orientation prop', () => {
            const { bindings } = createHost({ orientation: 'vertical' })
            expect(bindings.root['data-orientation']).toBe('vertical')
        })

        it('all bindings react when orientation ref changes', async () => {
            const orientation = ref<'horizontal' | 'vertical'>('horizontal')
            const { bindings } = createHost({ orientation })

            expect(bindings.root['aria-orientation']).toBeUndefined()
            expect(bindings.root['data-orientation']).toBe('horizontal')

            orientation.value = 'vertical'
            await nextTick()

            expect(bindings.root['aria-orientation']).toBe('vertical')
            expect(bindings.root['data-orientation']).toBe('vertical')
        })
    })
})