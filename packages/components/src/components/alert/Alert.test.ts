import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import Alert from './Alert.vue'

describe('Alert', () => {
    it('renders its slot content', () => {
        const wrapper = mount(Alert, {
            slots: {
                default: 'Alert message',
            },
        })

        expect(wrapper.text()).toBe('Alert message')
    })

    it('is open by default', () => {
        const wrapper = mount(Alert)

        expect(wrapper.exists()).toBe(true)
        expect(wrapper.attributes('data-state')).toBe('open')
    })

    it('supports defaultOpen=false', () => {
        const wrapper = mount(Alert, {
            props: {
                defaultOpen: false,
            },
        })

        expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    it('supports the alert role', () => {
        const wrapper = mount(Alert, {
            props: {
                role: 'alert',
            },
        })

        expect(wrapper.attributes('role')).toBe('alert')
        expect(wrapper.attributes('aria-live')).toBe('assertive')
    })

    it('uses status role by default', () => {
        const wrapper = mount(Alert)

        expect(wrapper.attributes('role')).toBe('status')
        expect(wrapper.attributes('aria-live')).toBe('polite')
        expect(wrapper.attributes('aria-atomic')).toBe('true')
    })

    it('closes through the slot action', async () => {
        const wrapper = mount(Alert, {
            slots: {
                default: ({ close }: { close: () => void }) => h('button', { onClick: close }, 'Close'),
            },
        })

        await wrapper.get('button').trigger('click')

        expect(wrapper.attributes('data-state')).toBe('closed')
    })

    it('opens through the slot action', async () => {
        const wrapper = mount(Alert, {
            props: {
                defaultOpen: false,
            },
            slots: {
                default: ({ open }: { open: () => void }) => h('button', { onClick: open }, 'Open'),
            },
        })

        await wrapper.get('button').trigger('click')

        expect(wrapper.attributes('data-state')).toBe('open')
    })

    it('calls onOpenChange when closed', async () => {
        const onOpenChange = vi.fn()

        const wrapper = mount(Alert, {
            props: {
                onOpenChange,
            },
            slots: {
                default: ({ close }: { close: () => void }) => h('button', { onClick: close }, 'Close'),
            },
        })

        await wrapper.get('button').trigger('click')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('does not change controlled state without updating the prop', async () => {
        const onOpenChange = vi.fn()

        const wrapper = mount(Alert, {
            props: {
                open: true,
                onOpenChange,
            },
            slots: {
                default: ({ close }: { close: () => void }) => h('button', { onClick: close }, 'Close'),
            },
        })

        await wrapper.get('button').trigger('click')

        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(wrapper.attributes('data-state')).toBe('open')
    })

    it('reacts to controlled open prop changes', async () => {
        const wrapper = mount(Alert, {
            props: {
                open: true,
            },
        })

        await wrapper.setProps({
            open: false,
        })

        expect(wrapper.attributes('data-state')).toBe('closed')
    })

    it('forwards native attributes', () => {
        const wrapper = mount(Alert, {
            attrs: {
                id: 'notification',
                'data-testid': 'alert',
            },
        })

        expect(wrapper.attributes('id')).toBe('notification')
        expect(wrapper.attributes('data-testid')).toBe('alert')
    })

    it('forwards class and style', () => {
        const wrapper = mount(Alert, {
            attrs: {
                class: 'custom-alert',
                style: 'color: red',
            },
        })

        expect(wrapper.classes()).toContain('custom-alert')
        expect(wrapper.attributes('style')).toContain('color: red')
    })

    it('allows overriding generated attributes', () => {
        const wrapper = mount(Alert, {
            attrs: {
                role: 'none',
                'aria-live': 'off',
                'data-state': 'custom',
            },
        })

        expect(wrapper.attributes('role')).toBe('none')
        expect(wrapper.attributes('aria-live')).toBe('off')
        expect(wrapper.attributes('data-state')).toBe('custom')
    })
})
