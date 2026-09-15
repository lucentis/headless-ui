import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollLock } from './useScrollLock'

function createHost() {
    let exposed: ReturnType<typeof useScrollLock>

    const Host = defineComponent({
        setup() { exposed = useScrollLock() },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return {
        wrapper,
        get lock() { return exposed.lock },
        get unlock() { return exposed.unlock },
    }
}

describe('useScrollLock', () => {
    beforeEach(() => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        document.body.style.marginRight = ''
    })

    describe('single instance', () => {
        it('lock sets overflow to hidden', () => {
            const { lock, wrapper } = createHost()
            lock()
            expect(document.body.style.overflow).toBe('hidden')
            wrapper.unmount()
        })

        it('unlock restores overflow', () => {
            const { lock, unlock, wrapper } = createHost()
            lock()
            unlock()
            expect(document.body.style.overflow).toBe('')
            wrapper.unmount()
        })

        it('unlock on unmount restores overflow', () => {
            const { lock, wrapper } = createHost()
            lock()
            wrapper.unmount()
            expect(document.body.style.overflow).toBe('')
        })

        it('calling lock twice does not double lock', () => {
            const { lock, unlock, wrapper } = createHost()
            lock()
            lock()
            unlock()
            expect(document.body.style.overflow).toBe('')
            wrapper.unmount()
        })

        it('calling unlock without lock does nothing', () => {
            const { unlock, wrapper } = createHost()
            unlock()
            expect(document.body.style.overflow).toBe('')
            wrapper.unmount()
        })
    })

    describe('multiple instances — reference counter', () => {
        it('body stays locked while any instance holds a lock', () => {
            const a = createHost()
            const b = createHost()

            a.lock()
            b.lock()

            a.unlock()
            // B is still locked — body should remain hidden
            expect(document.body.style.overflow).toBe('hidden')

            b.unlock()
            expect(document.body.style.overflow).toBe('')

            a.wrapper.unmount()
            b.wrapper.unmount()
        })

        it('second lock does not overwrite original overflow', () => {
            const a = createHost()
            const b = createHost()

            a.lock()
            b.lock()
            b.unlock()
            a.unlock()

            expect(document.body.style.overflow).toBe('')

            a.wrapper.unmount()
            b.wrapper.unmount()
        })

        it('unmounting one dialog does not unlock for the other', () => {
            const a = createHost()
            const b = createHost()

            a.lock()
            b.lock()

            a.wrapper.unmount()
            expect(document.body.style.overflow).toBe('hidden')

            b.wrapper.unmount()
            expect(document.body.style.overflow).toBe('')
        })
    })
})