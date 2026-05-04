import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useEscape } from './useEscape'

function createHost(active: boolean, onEscape: () => void) {
    const activeRef = ref(active)

    const Host = defineComponent({
        setup() {
            useEscape({ active: activeRef, onEscape })
        },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, active: activeRef }
}

describe('useEscape', () => {
    it('calls onEscape when Escape is pressed and active', async () => {
        const onEscape = vi.fn()
        const { wrapper } = createHost(true, onEscape)

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(onEscape).toHaveBeenCalledTimes(1)
        wrapper.unmount()
    })

    it('does not call onEscape when inactive', async () => {
        const onEscape = vi.fn()
        const { wrapper } = createHost(false, onEscape)

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(onEscape).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('does not call onEscape for other keys', async () => {
        const onEscape = vi.fn()
        const { wrapper } = createHost(true, onEscape)

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(onEscape).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('starts listening when active becomes true', async () => {
        const onEscape = vi.fn()
        const { wrapper, active } = createHost(false, onEscape)

        active.value = true
        await nextTick()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(onEscape).toHaveBeenCalledTimes(1)
        wrapper.unmount()
    })

    it('stops listening when active becomes false', async () => {
        const onEscape = vi.fn()
        const { wrapper, active } = createHost(true, onEscape)

        active.value = false
        await nextTick()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(onEscape).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('stops listening on unmount', async () => {
        const onEscape = vi.fn()
        const { wrapper } = createHost(true, onEscape)

        wrapper.unmount()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(onEscape).not.toHaveBeenCalled()
    })
})