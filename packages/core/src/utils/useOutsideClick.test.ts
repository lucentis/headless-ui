import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useOutsideClick } from './useOutsideClick'

function createHost(active: boolean, onOutsideClick: () => void) {
    const activeRef = ref(active)
    const target = ref<HTMLElement | null>(null)

    const Host = defineComponent({
        setup() {
            useOutsideClick({ targets: [target], active: activeRef, onOutsideClick })
        },
        template: '<div ref="el"><button id="inside">Inside</button></div>',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    target.value = wrapper.element as HTMLElement

    return { wrapper, active: activeRef, target }
}

describe('useOutsideClick', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    it('calls onOutsideClick when clicking outside', async () => {
        const onOutsideClick = vi.fn()
        const { wrapper } = createHost(true, onOutsideClick)

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

        expect(onOutsideClick).toHaveBeenCalledTimes(1)
        wrapper.unmount()
        outside.remove()
    })

    it('does not call onOutsideClick when clicking inside', async () => {
        const onOutsideClick = vi.fn()
        const { wrapper } = createHost(true, onOutsideClick)

        const inside = wrapper.find('#inside').element
        inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

        expect(onOutsideClick).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('does not call onOutsideClick when inactive', async () => {
        const onOutsideClick = vi.fn()
        const { wrapper } = createHost(false, onOutsideClick)

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

        expect(onOutsideClick).not.toHaveBeenCalled()
        wrapper.unmount()
        outside.remove()
    })

    it('starts listening when active becomes true', async () => {
        const onOutsideClick = vi.fn()
        const { wrapper, active } = createHost(false, onOutsideClick)

        active.value = true
        await nextTick()

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

        expect(onOutsideClick).toHaveBeenCalledTimes(1)
        wrapper.unmount()
        outside.remove()
    })

    it('stops listening when active becomes false', async () => {
        const onOutsideClick = vi.fn()
        const { wrapper, active } = createHost(true, onOutsideClick)

        active.value = false
        await nextTick()

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

        expect(onOutsideClick).not.toHaveBeenCalled()
        wrapper.unmount()
        outside.remove()
    })

    it('stops listening on unmount', () => {
        const onOutsideClick = vi.fn()
        const { wrapper } = createHost(true, onOutsideClick)

        wrapper.unmount()

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

        expect(onOutsideClick).not.toHaveBeenCalled()
        outside.remove()
    })

    it('excludes multiple targets', async () => {
        const onOutsideClick = vi.fn()
        const activeRef = ref(true)
        const target1 = ref<HTMLElement | null>(null)
        const target2 = ref<HTMLElement | null>(null)

        const Host = defineComponent({
            setup() {
                useOutsideClick({ targets: [target1, target2], active: activeRef, onOutsideClick })
            },
            template: '<div><div id="t1" /><div id="t2" /></div>',
        })

        const wrapper = mount(Host, { attachTo: document.body })
        target1.value = wrapper.find('#t1').element as HTMLElement
        target2.value = wrapper.find('#t2').element as HTMLElement

        target1.value.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        expect(onOutsideClick).not.toHaveBeenCalled()

        target2.value.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        expect(onOutsideClick).not.toHaveBeenCalled()

        wrapper.unmount()
    })
})