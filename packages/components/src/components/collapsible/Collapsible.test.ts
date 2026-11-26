import { describe, it, expect, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import Collapsible from './Collapsible.vue'
import CollapsibleTrigger from './CollapsibleTrigger.vue'
import CollapsibleContent from './CollapsibleContent.vue'

type TriggerProps = Record<string, unknown>

function mountCollapsible(props: Record<string, unknown> = {}, triggerProps: TriggerProps = {}) {
    return mount(Collapsible, {
        props,
        slots: {
            default: () => [
                h(CollapsibleTrigger, triggerProps, () => 'Toggle'),
                h(CollapsibleContent, null, () => 'Content'),
            ],
        },
    })
}

describe('Collapsible', () => {
    describe('uncontrolled', () => {
        it('is closed by default', () => {
            const wrapper = mountCollapsible()
            expect(wrapper.text()).not.toContain('Content')
            expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
        })

        it('supports defaultOpen', () => {
            const wrapper = mountCollapsible({ defaultOpen: true })
            expect(wrapper.text()).toContain('Content')
            expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
        })

        it('toggles when the trigger is clicked', async () => {
            const wrapper = mountCollapsible()

            await wrapper.get('button').trigger('click')
            expect(wrapper.text()).toContain('Content')

            await wrapper.get('button').trigger('click')
            expect(wrapper.text()).not.toContain('Content')
        })

        it('calls onOpenChange', async () => {
            const onOpenChange = vi.fn()
            const wrapper = mountCollapsible({ onOpenChange })

            await wrapper.get('button').trigger('click')

            expect(onOpenChange).toHaveBeenCalledWith(true)
        })
    })

    describe('controlled', () => {
        it('does not change without updating the prop', async () => {
            const onOpenChange = vi.fn()
            const wrapper = mountCollapsible({ open: false, onOpenChange })

            await wrapper.get('button').trigger('click')

            expect(onOpenChange).toHaveBeenCalledWith(true)
            expect(wrapper.text()).not.toContain('Content')
        })

        it('reacts to prop changes', async () => {
            const wrapper = mountCollapsible({ open: false })

            await wrapper.setProps({ open: true })
            expect(wrapper.text()).toContain('Content')

            await wrapper.setProps({ open: false })
            expect(wrapper.text()).not.toContain('Content')
        })
    })

    describe('disabled', () => {
        it('does not toggle and exposes the disabled state', async () => {
            const wrapper = mountCollapsible({ disabled: true })
            const trigger = wrapper.get('button')

            await trigger.trigger('click')

            expect(wrapper.text()).not.toContain('Content')
            expect(trigger.attributes('aria-disabled')).toBe('true')
            expect(trigger.attributes('data-disabled')).toBe('')
        })
    })

    describe('accessibility wiring', () => {
        it('links the trigger and the content', () => {
            const wrapper = mountCollapsible({ defaultOpen: true })
            const trigger = wrapper.get('button')
            const content = wrapper.get('[role="region"]')

            expect(trigger.attributes('aria-controls')).toBe(content.attributes('id'))
            expect(content.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
        })

        it('reflects the state in data-state', async () => {
            const wrapper = mountCollapsible()
            expect(wrapper.get('button').attributes('data-state')).toBe('closed')

            await wrapper.get('button').trigger('click')

            expect(wrapper.get('button').attributes('data-state')).toBe('open')
            expect(wrapper.get('[role="region"]').attributes('data-state')).toBe('open')
        })
    })

    describe('slot', () => {
        it('exposes state, actions and bindings', async () => {
            const wrapper = mount(Collapsible, {
                slots: {
                    default: ({ state, actions }: { state: { isOpen: boolean }; actions: { open: () => void } }) =>
                        h('button', { id: 'external', onClick: actions.open }, String(state.isOpen)),
                },
            })

            expect(wrapper.get('#external').text()).toBe('false')

            await wrapper.get('#external').trigger('click')

            expect(wrapper.get('#external').text()).toBe('true')
        })
    })

    describe('attribute forwarding', () => {
        it('forwards attributes to the root', () => {
            const wrapper = mountCollapsible({ class: 'root', 'data-testid': 'root' })
            expect(wrapper.classes()).toContain('root')
            expect(wrapper.attributes('data-testid')).toBe('root')
        })
    })
})

describe('CollapsibleTrigger', () => {
    it('is a button of type button', () => {
        const wrapper = mountCollapsible()
        expect(wrapper.get('button').attributes('type')).toBe('button')
    })

    it('forwards class and attributes', () => {
        const wrapper = mountCollapsible({}, { class: 'trigger', 'data-testid': 'trigger' })
        const trigger = wrapper.get('button')
        expect(trigger.classes()).toContain('trigger')
        expect(trigger.attributes('data-testid')).toBe('trigger')
    })

    it('runs the user click handler and still toggles', async () => {
        const onClick = vi.fn()
        const wrapper = mountCollapsible({}, { onClick })

        await wrapper.get('button').trigger('click')

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(wrapper.text()).toContain('Content')
    })

    it('does not toggle when the user handler calls preventDefault', async () => {
        const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
        const wrapper = mountCollapsible({}, { onClick })

        await wrapper.get('button').trigger('click')

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(wrapper.text()).not.toContain('Content')
    })

    it('runs every handler when several listeners are bound', async () => {
        const first = vi.fn()
        const second = vi.fn()
        const wrapper = mountCollapsible({}, { onClick: [first, second] })

        await wrapper.get('button').trigger('click')

        expect(first).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledTimes(1)
        expect(wrapper.text()).toContain('Content')
    })

    it('runs the user handler when disabled, without toggling', async () => {
        const onClick = vi.fn()
        const wrapper = mountCollapsible({ disabled: true }, { onClick })

        await wrapper.get('button').trigger('click')

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(wrapper.text()).not.toContain('Content')
    })

    it('throws outside a Collapsible', () => {
        expect(() => mount(CollapsibleTrigger)).toThrow(
            '[headless-ui] useCollapsibleContext must be used within a Collapsible',
        )
    })
})

describe('CollapsibleContent', () => {
    it('forwards class and attributes', () => {
        const wrapper = mount(Collapsible, {
            props: { defaultOpen: true },
            slots: {
                default: () => h(CollapsibleContent, { class: 'content', 'data-testid': 'content' }, () => 'Content'),
            },
        })
        const content = wrapper.get('[role="region"]')
        expect(content.classes()).toContain('content')
        expect(content.attributes('data-testid')).toBe('content')
    })

    it('is removed from the DOM once closed', async () => {
        const wrapper = mountCollapsible({ defaultOpen: true })

        await wrapper.get('button').trigger('click')
        await nextTick()

        expect(wrapper.find('[role="region"]').exists()).toBe(false)
    })

    it('throws outside a Collapsible', () => {
        expect(() => mount(CollapsibleContent)).toThrow(
            '[headless-ui] useCollapsibleContext must be used within a Collapsible',
        )
    })
})
