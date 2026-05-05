import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useControllableState } from './useControllableState'

function createHost<T>(options: Parameters<typeof useControllableState<T>>[0]) {
    let exposed: ReturnType<typeof useControllableState<T>>

    const Host = defineComponent({
        setup() {
            exposed = useControllableState(options)
        },
        template: '<div />',
    })

    mount(Host)
    return {
        get value() { return exposed.value },
        get setValue() { return exposed.setValue },
    }
}

describe('useControllableState', () => {
    describe('uncontrolled', () => {
        it('starts with defaultValue', () => {
            const { value } = createHost({ defaultValue: false })
            expect(value.value).toBe(false)
        })

        it('updates internal state on setValue', async () => {
            const { value, setValue } = createHost({ defaultValue: false })
            setValue(true)
            await nextTick()
            expect(value.value).toBe(true)
        })

        it('calls onChange on setValue', () => {
            const onChange = vi.fn()
            const { setValue } = createHost({ defaultValue: false, onChange })
            setValue(true)
            expect(onChange).toHaveBeenCalledWith(true)
        })

        it('works with string type', async () => {
            const { value, setValue } = createHost({ defaultValue: '' })
            setValue('tab-1')
            await nextTick()
            expect(value.value).toBe('tab-1')
        })

        it('works with array type', async () => {
            const { value, setValue } = createHost<string[]>({ defaultValue: [] })
            setValue(['item-1', 'item-2'])
            await nextTick()
            expect(value.value).toEqual(['item-1', 'item-2'])
        })
    })

    describe('controlled', () => {
        it('reflects controlled value', () => {
            const controlled = ref('tab-1')
            const { value } = createHost({ value: controlled, defaultValue: '' })
            expect(value.value).toBe('tab-1')
        })

        it('reacts when controlled ref changes', async () => {
            const controlled = ref('tab-1')
            const { value } = createHost({ value: controlled, defaultValue: '' })
            controlled.value = 'tab-2'
            await nextTick()
            expect(value.value).toBe('tab-2')
        })

        it('does not mutate internal state on setValue', async () => {
            const controlled = ref('tab-1')
            const { value, setValue } = createHost({ value: controlled, defaultValue: '' })
            setValue('tab-2')
            await nextTick()
            expect(value.value).toBe('tab-1')
        })

        it('still calls onChange in controlled mode', () => {
            const onChange = vi.fn()
            const controlled = ref(false)
            const { setValue } = createHost({ value: controlled, defaultValue: false, onChange })
            setValue(true)
            expect(onChange).toHaveBeenCalledWith(true)
        })

        it('accepts a static value (non-ref)', () => {
            const { value } = createHost({ value: true, defaultValue: false })
            expect(value.value).toBe(true)
        })
    })
})