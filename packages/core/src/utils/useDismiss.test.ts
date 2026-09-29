import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDismiss } from './useDismiss'

function createHost(options: {
    active?: boolean
    escape?: boolean
    outsideClick?: boolean
} = {}) {
    const activeRef = ref(options.active ?? true)
    const escapeRef = ref(options.escape ?? true)
    const outsideClickRef = ref(options.outsideClick ?? true)
    const onDismiss = vi.fn()
    const triggerRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)

    const Host = defineComponent({
        setup() {
            useDismiss({
                active: activeRef,
                targets: [triggerRef, contentRef],
                onDismiss,
                escape: escapeRef,
                outsideClick: outsideClickRef,
            })
        },
        template: '<div><button ref="triggerEl">Trigger</button><div ref="contentEl"><button id="inside">Inside</button></div></div>',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    triggerRef.value = wrapper.find('button').element as HTMLElement
    contentRef.value = wrapper.findAll('div')[1].element as HTMLElement

    return { wrapper, onDismiss, active: activeRef, escape: escapeRef, outsideClick: outsideClickRef, contentRef }
}

describe('useDismiss', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('escape', () => {
        it('calls onDismiss on Escape when active', () => {
            const { onDismiss, wrapper } = createHost()

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

            expect(onDismiss).toHaveBeenCalledTimes(1)
            wrapper.unmount()
        })

        it('does not call onDismiss on Escape when inactive', () => {
            const { onDismiss, wrapper } = createHost({ active: false })

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
            wrapper.unmount()
        })

        it('does not call onDismiss on Escape when escape is false', () => {
            const { onDismiss, wrapper } = createHost({ escape: false })

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
            wrapper.unmount()
        })

        it('starts responding to Escape when escape becomes true', async () => {
            const { onDismiss, escape, wrapper } = createHost({ escape: false })

            escape.value = true
            await nextTick()
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

            expect(onDismiss).toHaveBeenCalledTimes(1)
            wrapper.unmount()
        })
    })

    describe('outside click', () => {
        it('calls onDismiss when clicking outside the targets', () => {
            const { onDismiss, wrapper } = createHost()

            const outside = document.createElement('button')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).toHaveBeenCalledTimes(1)
            wrapper.unmount()
            outside.remove()
        })

        it('does not call onDismiss when clicking inside a target', () => {
            const { onDismiss, contentRef, wrapper } = createHost()

            const inside = contentRef.value!.querySelector('#inside')!
            inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
            wrapper.unmount()
        })

        it('does not call onDismiss when clicking outside if inactive', () => {
            const { onDismiss, wrapper } = createHost({ active: false })

            const outside = document.createElement('button')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
            wrapper.unmount()
            outside.remove()
        })

        it('does not call onDismiss when clicking outside if outsideClick is false', () => {
            const { onDismiss, wrapper } = createHost({ outsideClick: false })

            const outside = document.createElement('button')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
            wrapper.unmount()
            outside.remove()
        })

        it('starts responding to outside clicks when outsideClick becomes true', async () => {
            const { onDismiss, outsideClick, wrapper } = createHost({ outsideClick: false })

            outsideClick.value = true
            await nextTick()

            const outside = document.createElement('button')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).toHaveBeenCalledTimes(1)
            wrapper.unmount()
            outside.remove()
        })
    })

    describe('escape and outside click independence', () => {
        it('outside click still dismisses when escape is disabled', () => {
            const { onDismiss, wrapper } = createHost({ escape: false })

            const outside = document.createElement('button')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).toHaveBeenCalledTimes(1)
            wrapper.unmount()
            outside.remove()
        })

        it('escape still dismisses when outside click is disabled', () => {
            const { onDismiss, wrapper } = createHost({ outsideClick: false })

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

            expect(onDismiss).toHaveBeenCalledTimes(1)
            wrapper.unmount()
        })
    })

    describe('unmount', () => {
        it('stops listening for Escape on unmount', () => {
            const { onDismiss, wrapper } = createHost()

            wrapper.unmount()
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
        })

        it('stops listening for outside clicks on unmount', () => {
            const { onDismiss, wrapper } = createHost()

            wrapper.unmount()

            const outside = document.createElement('button')
            document.body.appendChild(outside)
            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

            expect(onDismiss).not.toHaveBeenCalled()
            outside.remove()
        })
    })
})