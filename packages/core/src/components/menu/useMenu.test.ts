import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useMenu } from './useMenu'
import { provideMenuContext, useMenuContext } from './MenuContext'

function createHost(props: Parameters<typeof useMenu>[0] = {}) {
    let exposed: ReturnType<typeof useMenu>

    const Host = defineComponent({
        setup() { exposed = useMenu(props) },
        template: '<div />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return {
        wrapper,
        get state() { return exposed.state },
        get actions() { return exposed.actions },
        get bindings() { return exposed.bindings },
        get triggerRef() { return exposed.triggerRef },
        get contentRef() { return exposed.contentRef },
        get registerItem() { return exposed.registerItem },
        get unregisterItem() { return exposed.unregisterItem },
    }
}

describe('useMenu', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('state', () => {
        it('isOpen defaults to false', () => {
            const { state, wrapper } = createHost()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('isPresent mirrors isOpen by default', () => {
            const { state, wrapper } = createHost()
            expect(state.isPresent).toBe(state.isOpen)
            wrapper.unmount()
        })

        it('highlightValue defaults to null', () => {
            const { state, wrapper } = createHost()
            expect(state.highlightValue).toBeNull()
            wrapper.unmount()
        })

        it('triggerId and contentId are stable strings', () => {
            const { state, wrapper } = createHost()
            expect(typeof state.triggerId).toBe('string')
            expect(typeof state.contentId).toBe('string')
            expect(state.triggerId).not.toBe(state.contentId)
            wrapper.unmount()
        })

        it('reflects controlled open ref', async () => {
            const open = ref(false)
            const { state, wrapper } = createHost({ open })
            open.value = true
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })
    })

    describe('actions — open/close', () => {
        it('open sets isOpen to true', async () => {
            const { state, actions, wrapper } = createHost()
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })

        it('close sets isOpen to false', async () => {
            const { state, actions, wrapper } = createHost({ defaultOpen: true })
            actions.close()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('toggle flips isOpen', async () => {
            const { state, actions, wrapper } = createHost()
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(true)
            actions.toggle()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('close resets highlightValue to null', async () => {
            const { state, actions, wrapper } = createHost({ defaultOpen: true })
            actions.highlight('item-1')
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            actions.close()
            await nextTick()
            expect(state.highlightValue).toBeNull()
            wrapper.unmount()
        })

        it('calls onOpenChange', () => {
            const onOpenChange = vi.fn()
            const { actions, wrapper } = createHost({ onOpenChange })
            actions.open()
            expect(onOpenChange).toHaveBeenCalledWith(true)
            wrapper.unmount()
        })

        it('does not mutate state in controlled mode', async () => {
            const open = ref(false)
            const { state, actions, wrapper } = createHost({ open })
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('actions — navigation', () => {
        it('highlight sets highlightValue', async () => {
            const { state, actions, wrapper } = createHost()
            actions.highlight('item-1')
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('isHighlight returns true for Highlight item', async () => {
            const { actions, wrapper } = createHost()
            actions.highlight('item-1')
            await nextTick()
            expect(actions.isHighlight('item-1')).toBe(true)
            expect(actions.isHighlight('item-2')).toBe(false)
            wrapper.unmount()
        })

        it('highlightFirst highlights first registered item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            registerItem('item-3')
            actions.highlightFirst()
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('highlightLast highlights last registered item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            registerItem('item-3')
            actions.highlightLast()
            await nextTick()
            expect(state.highlightValue).toBe('item-3')
            wrapper.unmount()
        })

        it('highlightNext moves to next item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            registerItem('item-3')
            actions.highlight('item-1')
            actions.highlightNext()
            await nextTick()
            expect(state.highlightValue).toBe('item-2')
            wrapper.unmount()
        })

        it('highlightNext does not go past last item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            actions.highlight('item-2')
            actions.highlightNext()
            await nextTick()
            expect(state.highlightValue).toBe('item-2')
            wrapper.unmount()
        })

        it('highlightPrev moves to previous item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            registerItem('item-3')
            actions.highlight('item-3')
            actions.highlightPrev()
            await nextTick()
            expect(state.highlightValue).toBe('item-2')
            wrapper.unmount()
        })

        it('highlightPrev does not go past first item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            actions.highlight('item-1')
            actions.highlightPrev()
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('highlightNext from null highlights first item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            actions.highlightNext()
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('highlightPrev from null highlights last item', async () => {
            const { state, actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            actions.highlightPrev()
            await nextTick()
            expect(state.highlightValue).toBe('item-2')
            wrapper.unmount()
        })
    })

    describe('item registration', () => {
        it('registerItem adds item to registry', async () => {
            const { actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            actions.highlightFirst()
            await nextTick()
            expect(actions.isHighlight('item-1')).toBe(true)
            wrapper.unmount()
        })

        it('unregisterItem removes item from registry', async () => {
            const { actions, registerItem, unregisterItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-2')
            unregisterItem('item-1')
            actions.highlightFirst()
            await nextTick()
            expect(actions.isHighlight('item-2')).toBe(true)
            wrapper.unmount()
        })

        it('does not register duplicate items', async () => {
            const { actions, registerItem, wrapper } = createHost()
            registerItem('item-1')
            registerItem('item-1')
            actions.highlightFirst()
            await nextTick()
            expect(actions.isHighlight('item-1')).toBe(true)
            wrapper.unmount()
        })
    })

    describe('bindings.trigger', () => {
        it('aria-haspopup is menu', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.trigger['aria-haspopup']).toBe('menu')
            wrapper.unmount()
        })

        it('aria-expanded reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createHost()
            expect(bindings.trigger['aria-expanded']).toBe(false)
            actions.open()
            await nextTick()
            expect(bindings.trigger['aria-expanded']).toBe(true)
            wrapper.unmount()
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createHost()
            expect(bindings.trigger['data-state']).toBe('closed')
            actions.open()
            await nextTick()
            expect(bindings.trigger['data-state']).toBe('open')
            wrapper.unmount()
        })

        it('onClick toggles menu', async () => {
            const { state, bindings, wrapper } = createHost()
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })
    })

    describe('bindings.content', () => {
        it('role is menu', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.content.role).toBe('menu')
            wrapper.unmount()
        })

        it('tabindex is -1', () => {
            const { bindings, wrapper } = createHost()
            expect(bindings.content.tabindex).toBe(-1)
            wrapper.unmount()
        })

        it('aria-activedescendant reflects highlightValue', async () => {
            const { bindings, actions, state, wrapper } = createHost()
            expect(bindings.content['aria-activedescendant']).toBeUndefined()
            actions.highlight('item-1')
            await nextTick()
            expect(bindings.content['aria-activedescendant']).toBe(`${state.contentId}-item-item-1`)
            wrapper.unmount()
        })

        it('ArrowDown highlights next item', async () => {
            const { state, bindings, registerItem, wrapper } = createHost({ defaultOpen: true })
            registerItem('item-1')
            registerItem('item-2')
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('ArrowUp highlights prev item', async () => {
            const { state, actions, bindings, registerItem, wrapper } = createHost({ defaultOpen: true })
            registerItem('item-1')
            registerItem('item-2')
            actions.highlight('item-2')
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('Home highlights first item', async () => {
            const { state, actions, bindings, registerItem, wrapper } = createHost({ defaultOpen: true })
            registerItem('item-1')
            registerItem('item-2')
            registerItem('item-3')
            actions.highlight('item-3')
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }))
            await nextTick()
            expect(state.highlightValue).toBe('item-1')
            wrapper.unmount()
        })

        it('End highlights last item', async () => {
            const { state, bindings, registerItem, wrapper } = createHost({ defaultOpen: true })
            registerItem('item-1')
            registerItem('item-2')
            registerItem('item-3')
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'End' }))
            await nextTick()
            expect(state.highlightValue).toBe('item-3')
            wrapper.unmount()
        })

        it('Tab closes menu', async () => {
            const { state, actions, bindings, wrapper } = createHost()
            actions.open()
            await nextTick()
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }))
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('escape', () => {
        it('closes on Escape key', async () => {
            const { state, actions, wrapper } = createHost()
            actions.open()
            await nextTick()
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('context', () => {
        it('useMenuContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useMenuContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useMenuContext must be used within a Menu')
        })

        it('useMenuContext returns api inside provider', () => {
            let innerApi: ReturnType<typeof useMenuContext> | undefined

            const Child = defineComponent({
                setup() { innerApi = useMenuContext() },
                template: '<div />',
            })

            const Parent = defineComponent({
                components: { Child },
                setup() {
                    const api = useMenu()
                    provideMenuContext(api)
                },
                template: '<Child />',
            })

            mount(Parent, { attachTo: document.body })
            expect(innerApi).toBeDefined()
            expect(typeof innerApi!.state.isOpen).toBe('boolean')
        })
    })
})