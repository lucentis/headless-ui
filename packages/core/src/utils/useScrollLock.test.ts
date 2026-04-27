import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollLock } from './useScrollLock'

// Mount a component that uses the composable so Vue lifecycle hooks work correctly.
function createHost() {
    let exposed: ReturnType<typeof useScrollLock>

    const Host = defineComponent({
        setup() {
        exposed = useScrollLock()
        },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, get lock() { return exposed.lock }, get unlock() { return exposed.unlock } }
}

describe('useScrollLock', () => {
    beforeEach(() => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
    })

    it('sets overflow hidden on lock', () => {
        const { lock } = createHost()
        lock()
        expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores overflow on unlock', () => {
        const { lock, unlock } = createHost()
        lock()
        unlock()
        expect(document.body.style.overflow).toBe('')
    })

    it('does not double lock if called twice', () => {
        const { lock, unlock } = createHost()
        document.body.style.overflow = ''
        lock()
        lock()
        unlock()
        // after one unlock, overflow should be restored
        expect(document.body.style.overflow).toBe('')
    })

    it('restores scroll on component unmount', async () => {
        const { wrapper, lock } = createHost()
        lock()
        expect(document.body.style.overflow).toBe('hidden')
        wrapper.unmount()
        await nextTick()
        expect(document.body.style.overflow).toBe('')
    })

    it('does nothing on unlock if not locked', () => {
        const { unlock } = createHost()
        expect(() => unlock()).not.toThrow()
        expect(document.body.style.overflow).toBe('')
    })
})