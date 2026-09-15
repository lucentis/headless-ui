import { describe, it, expect } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDisabled } from './useDisabled'

function createHost(disabled?: Parameters<typeof useDisabled>[0]) {
    let exposed: ReturnType<typeof useDisabled>

    const Host = defineComponent({
        setup() { exposed = useDisabled(disabled) },
        template: '<div />',
    })

    mount(Host)
    return { get result() { return exposed } }
}

describe('useDisabled', () => {
    it('returns false when no argument provided', () => {
        const { result } = createHost()
        expect(result.value).toBe(false)
    })

    it('returns false when undefined', () => {
        const { result } = createHost(undefined)
        expect(result.value).toBe(false)
    })

    it('reflects a static true', () => {
        const { result } = createHost(true)
        expect(result.value).toBe(true)
    })

    it('reflects a static false', () => {
        const { result } = createHost(false)
        expect(result.value).toBe(false)
    })

    it('reflects a ref', () => {
        const disabled = ref(false)
        const { result } = createHost(disabled)
        expect(result.value).toBe(false)
    })

    it('reacts when ref changes to true', async () => {
        const disabled = ref(false)
        const { result } = createHost(disabled)
        disabled.value = true
        await nextTick()
        expect(result.value).toBe(true)
    })

    it('reacts when ref changes to false', async () => {
        const disabled = ref(true)
        const { result } = createHost(disabled)
        disabled.value = false
        await nextTick()
        expect(result.value).toBe(false)
    })
})