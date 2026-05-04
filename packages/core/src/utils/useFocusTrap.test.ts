import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useFocusTrap } from './useFocusTrap'

function createHost(options: {
    active?: boolean
    html?: string
    initialFocus?: HTMLElement | null
} = {}) {
    const active = ref(options.active ?? false)
    const container = ref<HTMLElement | null>(null)
    const initialFocus = ref(options.initialFocus ?? null)

    const Host = defineComponent({
        setup() {
            useFocusTrap({ container, active, initialFocus })
        },
        template: options.html ?? `
            <div ref="el">
                <button id="btn1">Button 1</button>
                <button id="btn2">Button 2</button>
                <button id="btn3">Button 3</button>
            </div>
        `,
    })

    const wrapper = mount(Host, { attachTo: document.body })
    container.value = wrapper.element.querySelector('div') ?? wrapper.element as HTMLElement

    return { wrapper, active, container, initialFocus }
}

describe('useFocusTrap', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    it('does not move focus when inactive', async () => {
        const { wrapper } = createHost({ active: false })
        const btn = wrapper.find('#btn1').element as HTMLElement
        expect(document.activeElement).not.toBe(btn)
        wrapper.unmount()
    })

    it('moves focus to first focusable element on activate', async () => {
        const { active, wrapper } = createHost({ active: false })
        active.value = true
        await nextTick()
        expect(document.activeElement?.id).toBe('btn1')
        wrapper.unmount()
    })

    it('moves focus to data-autofocus element', async () => {
        const { active, wrapper } = createHost({
            active: false,
            html: `
                <div>
                    <button id="btn1">Button 1</button>
                    <button id="btn2" data-autofocus>Button 2</button>
                </div>
            `,
        })
        active.value = true
        await nextTick()
        expect(document.activeElement?.id).toBe('btn2')
        wrapper.unmount()
    })

    it('moves focus to initialFocus element when provided', async () => {
        const { active, wrapper, initialFocus } = createHost({ active: false })
        const btn3 = wrapper.find('#btn3').element as HTMLElement
        initialFocus.value = btn3
        active.value = true
        await nextTick()
        expect(document.activeElement).toBe(btn3)
        wrapper.unmount()
    })

    it('falls back to container when no focusable elements', async () => {
        const { active, container, wrapper } = createHost({
            active: false,
            html: '<div><p>No focusable</p></div>',
        })
        active.value = true
        await nextTick()
        expect(document.activeElement).toBe(container.value)
        wrapper.unmount()
    })

    it('restores focus to previous element on deactivate', async () => {
        const trigger = document.createElement('button')
        document.body.appendChild(trigger)
        trigger.focus()

        const { active, wrapper } = createHost({ active: false })
        active.value = true
        await nextTick()
        active.value = false
        await nextTick()
        expect(document.activeElement).toBe(trigger)
        wrapper.unmount()
        trigger.remove()
    })

    it('traps Tab key within container', async () => {
        const { active, wrapper } = createHost({ active: false })
        active.value = true
        await nextTick()

        const btn3 = wrapper.find('#btn3').element as HTMLElement
        btn3.focus()

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
        document.dispatchEvent(event)

        await nextTick()
        expect(document.activeElement?.id).toBe('btn1')
        wrapper.unmount()
    })

    it('traps Shift+Tab key within container', async () => {
        const { active, wrapper } = createHost({ active: false })
        active.value = true
        await nextTick()

        const btn1 = wrapper.find('#btn1').element as HTMLElement
        btn1.focus()

        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
        document.dispatchEvent(event)

        await nextTick()
        expect(document.activeElement?.id).toBe('btn3')
        wrapper.unmount()
    })

    it('deactivates on unmount', async () => {
        const trigger = document.createElement('button')
        document.body.appendChild(trigger)
        trigger.focus()

        const { active, wrapper } = createHost({ active: false })
        active.value = true
        await nextTick()
        wrapper.unmount()
        await nextTick()

        expect(document.activeElement).toBe(trigger)
        trigger.remove()
    })
})