import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Separator from './Separator.vue'

describe('Separator', () => {
    it('renders a div element', () => {
        const wrapper = mount(Separator)

        expect(wrapper.element.tagName).toBe('DIV')
    })

    it('uses horizontal orientation by default', () => {
        const wrapper = mount(Separator)

        expect(wrapper.attributes('role')).toBe('separator')
        expect(wrapper.attributes('data-orientation')).toBe('horizontal')
        expect(wrapper.attributes('aria-orientation')).toBeUndefined()
    })

    it('supports vertical orientation', () => {
        const wrapper = mount(Separator, {
            props: {
                orientation: 'vertical',
            },
        })

        expect(wrapper.attributes('role')).toBe('separator')
        expect(wrapper.attributes('aria-orientation')).toBe('vertical')
        expect(wrapper.attributes('data-orientation')).toBe('vertical')
    })

    it('supports decorative mode', () => {
        const wrapper = mount(Separator, {
            props: {
                decorative: true,
            },
        })

        expect(wrapper.attributes('role')).toBe('none')
        expect(wrapper.attributes('aria-orientation')).toBeUndefined()
    })

    it('omits aria-orientation when decorative and vertical', () => {
        const wrapper = mount(Separator, {
            props: {
                orientation: 'vertical',
                decorative: true,
            },
        })

        expect(wrapper.attributes('role')).toBe('none')
        expect(wrapper.attributes('aria-orientation')).toBeUndefined()
        expect(wrapper.attributes('data-orientation')).toBe('vertical')
    })

    it('reacts to orientation prop changes', async () => {
        const wrapper = mount(Separator)

        await wrapper.setProps({
            orientation: 'vertical',
        })

        expect(wrapper.attributes('aria-orientation')).toBe('vertical')
        expect(wrapper.attributes('data-orientation')).toBe('vertical')

        await wrapper.setProps({
            orientation: 'horizontal',
        })

        expect(wrapper.attributes('aria-orientation')).toBeUndefined()
        expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    })

    it('reacts to decorative prop changes', async () => {
        const wrapper = mount(Separator)

        await wrapper.setProps({
            decorative: true,
        })

        expect(wrapper.attributes('role')).toBe('none')

        await wrapper.setProps({
            decorative: false,
        })

        expect(wrapper.attributes('role')).toBe('separator')
    })

    it('forwards native attributes', () => {
        const wrapper = mount(Separator, {
            attrs: {
                id: 'section-separator',
                'aria-label': 'Section separator',
                'data-testid': 'separator',
            },
        })

        expect(wrapper.attributes('id')).toBe('section-separator')
        expect(wrapper.attributes('aria-label')).toBe('Section separator')
        expect(wrapper.attributes('data-testid')).toBe('separator')
    })

    it('forwards class and style', () => {
        const wrapper = mount(Separator, {
            attrs: {
                class: 'custom-separator',
                style: 'background-color: red',
            },
        })

        expect(wrapper.classes()).toContain('custom-separator')
        expect(wrapper.attributes('style')).toContain('background-color: red')
    })

    it('allows overriding generated attributes', () => {
        const wrapper = mount(Separator, {
            props: {
                orientation: 'vertical',
            },
            attrs: {
                role: 'none',
                'aria-orientation': 'horizontal',
                'data-orientation': 'custom',
            },
        })

        expect(wrapper.attributes('role')).toBe('none')
        expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
        expect(wrapper.attributes('data-orientation')).toBe('custom')
    })
})
