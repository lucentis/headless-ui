import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
    it('renders its slot content', () => {
        const wrapper = mount(Button, {
            slots: {
                default: 'Click me',
            },
        })

        expect(wrapper.text()).toBe('Click me')
    })

    it('renders a native button element', () => {
        const wrapper = mount(Button)

        expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('uses button as the default type', () => {
        const wrapper = mount(Button)

        expect(wrapper.attributes('type')).toBe('button')
    })

    it.each(['button', 'submit', 'reset'] as const)('supports the "%s" type', (type) => {
        const wrapper = mount(Button, {
            props: { type },
        })

        expect(wrapper.attributes('type')).toBe(type)
    })

    it('is enabled by default', () => {
        const wrapper = mount(Button)

        expect(wrapper.element.disabled).toBe(false)
        expect(wrapper.attributes('aria-disabled')).toBeUndefined()
        expect(wrapper.attributes('data-disabled')).toBeUndefined()
    })

    it('supports the disabled prop', () => {
        const wrapper = mount(Button, {
            props: {
                disabled: true,
            },
        })

        expect(wrapper.element.disabled).toBe(true)
        expect(wrapper.attributes('aria-disabled')).toBe('true')
        expect(wrapper.attributes('data-disabled')).toBe('')
    })

    it('reacts to disabled prop changes', async () => {
        const wrapper = mount(Button)

        await wrapper.setProps({
            disabled: true,
        })

        expect(wrapper.element.disabled).toBe(true)

        await wrapper.setProps({
            disabled: false,
        })

        expect(wrapper.element.disabled).toBe(false)
        expect(wrapper.attributes('aria-disabled')).toBeUndefined()
        expect(wrapper.attributes('data-disabled')).toBeUndefined()
    })

    it('allows overriding generated ARIA attributes', () => {
        const wrapper = mount(Button, {
            props: {
                disabled: true,
            },
            attrs: {
                'aria-disabled': 'false',
            },
        })

        expect(wrapper.element.disabled).toBe(true)
        expect(wrapper.attributes('aria-disabled')).toBe('false')
    })

    it('allows overriding generated data attributes', () => {
        const wrapper = mount(Button, {
            props: {
                disabled: true,
            },
            attrs: {
                'data-disabled': 'custom',
            },
        })

        expect(wrapper.attributes('data-disabled')).toBe('custom')
    })

    it('forwards native attributes', () => {
        const wrapper = mount(Button, {
            attrs: {
                id: 'save-button',
                'aria-label': 'Save',
                'data-testid': 'save',
            },
        })

        expect(wrapper.attributes('id')).toBe('save-button')
        expect(wrapper.attributes('aria-label')).toBe('Save')
        expect(wrapper.attributes('data-testid')).toBe('save')
    })

    it('forwards class and style', () => {
        const wrapper = mount(Button, {
            attrs: {
                class: 'custom-button',
                style: 'color: red',
            },
        })

        expect(wrapper.classes()).toContain('custom-button')
        expect(wrapper.attributes('style')).toContain('color: red')
    })

    it('forwards native click events', async () => {
        const onClick = vi.fn()

        const wrapper = mount(Button, {
            attrs: {
                onClick,
            },
        })

        await wrapper.trigger('click')

        expect(onClick).toHaveBeenCalledOnce()
    })
})
