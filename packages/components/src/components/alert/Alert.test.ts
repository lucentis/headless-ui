import { describe, it, expect, vi } from 'vitest'
import { h, nextTick } from 'vue'
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
                default: ({ actions }: { state: unknown; actions: { close: () => void }; bindings: unknown }) =>
                    h('button', { onClick: actions.close }, 'Close'),
            },
        })

        await wrapper.get('button').trigger('click')

        // A closed alert is unmounted, so there is no element left to carry data-state="closed".
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    it('does not render its slot when closed', () => {
        const wrapper = mount(Alert, {
            props: {
                defaultOpen: false,
            },
            slots: {
                default: 'Alert message',
            },
        })

        expect(wrapper.text()).toBe('')
    })

    it('opens through the exposed open action', async () => {
        const wrapper = mount(Alert, {
            props: {
                defaultOpen: false,
            },
        })

        wrapper.vm.actions.open()
        await nextTick()

        expect(wrapper.attributes('data-state')).toBe('open')
    })

    it('closes through the exposed close action', async () => {
        const wrapper = mount(Alert)

        wrapper.vm.actions.close()
        await nextTick()

        expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    it('calls onOpenChange when closed', async () => {
        const onOpenChange = vi.fn()

        const wrapper = mount(Alert, {
            props: {
                onOpenChange,
            },
            slots: {
                default: ({ actions }: { state: unknown; actions: { close: () => void }; bindings: unknown }) =>
                    h('button', { onClick: actions.close }, 'Close'),
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
                default: ({ actions }: { state: unknown; actions: { close: () => void }; bindings: unknown }) =>
                    h('button', { onClick: actions.close }, 'Close'),
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

        expect(wrapper.find('[role="status"]').exists()).toBe(false)

        await wrapper.setProps({
            open: true,
        })

        expect(wrapper.attributes('data-state')).toBe('open')
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
