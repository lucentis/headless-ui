import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useAccordion } from './useAccordion'
import { useAccordionItem } from './useAccordionItem'
import { provideAccordionContext, useAccordionContext } from './AccordionContext'

function createAccordionHost(props: Parameters<typeof useAccordion>[0] = {}) {
    let exposed: ReturnType<typeof useAccordion>

    const Host = defineComponent({
        setup() { exposed = useAccordion(props) },
        template: '<div />',
    })

    mount(Host)
    return {
        get state() { return exposed.state },
        get actions() { return exposed.actions },
    }
}

function createItemHost(
    accordionProps: Parameters<typeof useAccordion>[0] = {},
    itemProps: Parameters<typeof useAccordionItem>[0],
) {
    let exposedAccordion: ReturnType<typeof useAccordion>
    let exposedItem: ReturnType<typeof useAccordionItem>

    const Host = defineComponent({
        setup() {
            exposedAccordion = useAccordion(accordionProps)
            exposedItem = useAccordionItem(itemProps, exposedAccordion)
        },
        template: '<div />',
    })

    mount(Host)
    return {
        get accordion() { return exposedAccordion },
        get state() { return exposedItem.state },
        get actions() { return exposedItem.actions },
        get bindings() { return exposedItem.bindings },
    }
}

describe('useAccordion', () => {
    describe('state', () => {
        it('type defaults to single', () => {
            const { state } = createAccordionHost()
            expect(state.type).toBe('single')
        })

        it('value defaults to empty string in single mode', () => {
            const { state } = createAccordionHost()
            expect(state.value).toBe('')
        })

        it('value defaults to empty array in multiple mode', () => {
            const { state } = createAccordionHost({ type: 'multiple' })
            expect(state.value).toEqual([])
        })

        it('isDisabled defaults to false', () => {
            const { state } = createAccordionHost()
            expect(state.isDisabled).toBe(false)
        })

        it('reflects defaultValue', () => {
            const { state } = createAccordionHost({ defaultValue: 'item-1' })
            expect(state.value).toBe('item-1')
        })

        it('reflects controlled value', () => {
            const value = ref('item-1')
            const { state } = createAccordionHost({ value })
            expect(state.value).toBe('item-1')
        })

        it('reacts when controlled value ref changes', async () => {
            const value = ref('item-1')
            const { state } = createAccordionHost({ value })
            value.value = 'item-2'
            await nextTick()
            expect(state.value).toBe('item-2')
        })
    })

    describe('actions — single mode', () => {
        it('isExpanded returns true for expanded item', () => {
            const { actions } = createAccordionHost({ defaultValue: 'item-1' })
            expect(actions.isExpanded('item-1')).toBe(true)
        })

        it('isExpanded returns false for collapsed item', () => {
            const { actions } = createAccordionHost()
            expect(actions.isExpanded('item-1')).toBe(false)
        })

        it('expand opens an item', async () => {
            const { state, actions } = createAccordionHost()
            actions.expand('item-1')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(true)
        })

        it('expand closes previously open item in single mode', async () => {
            const { actions } = createAccordionHost({ defaultValue: 'item-1' })
            actions.expand('item-2')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(false)
            expect(actions.isExpanded('item-2')).toBe(true)
        })

        it('collapse closes an item', async () => {
            const { actions } = createAccordionHost({ defaultValue: 'item-1' })
            actions.collapse('item-1')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(false)
        })

        it('toggle flips item state', async () => {
            const { actions } = createAccordionHost()
            actions.toggle('item-1')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(true)
            actions.toggle('item-1')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(false)
        })

        it('calls onValueChange on expand', () => {
            const onValueChange = vi.fn()
            const { actions } = createAccordionHost({ onValueChange })
            actions.expand('item-1')
            expect(onValueChange).toHaveBeenCalledWith('item-1')
        })

        it('does not mutate state in controlled mode', async () => {
            const value = ref('item-1')
            const { actions } = createAccordionHost({ value })
            actions.expand('item-2')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(true)
            expect(actions.isExpanded('item-2')).toBe(false)
        })
    })

    describe('actions — multiple mode', () => {
        it('expand adds item without closing others', async () => {
            const { actions } = createAccordionHost({ type: 'multiple', defaultValue: ['item-1'] })
            actions.expand('item-2')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(true)
            expect(actions.isExpanded('item-2')).toBe(true)
        })

        it('collapse removes only that item', async () => {
            const { actions } = createAccordionHost({ type: 'multiple', defaultValue: ['item-1', 'item-2'] })
            actions.collapse('item-1')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(false)
            expect(actions.isExpanded('item-2')).toBe(true)
        })
    })

    describe('disabled', () => {
        it('expand does nothing when accordion is disabled', async () => {
            const { actions } = createAccordionHost({ disabled: true })
            actions.expand('item-1')
            await nextTick()
            expect(actions.isExpanded('item-1')).toBe(false)
        })
    })
})

describe('useAccordionItem', () => {
    describe('state', () => {
        it('isExpanded reflects accordion state', async () => {
            const { state, accordion } = createItemHost({}, { value: 'item-1' })
            expect(state.isExpanded).toBe(false)
            accordion.actions.expand('item-1')
            await nextTick()
            expect(state.isExpanded).toBe(true)
        })

        it('isDisabled is true when accordion is disabled', () => {
            const { state } = createItemHost({ disabled: true }, { value: 'item-1' })
            expect(state.isDisabled).toBe(true)
        })

        it('isDisabled is true when item is disabled', () => {
            const { state } = createItemHost({}, { value: 'item-1', disabled: true })
            expect(state.isDisabled).toBe(true)
        })

        it('triggerId and contentId are stable strings', () => {
            const { state } = createItemHost({}, { value: 'item-1' })
            expect(typeof state.triggerId).toBe('string')
            expect(typeof state.contentId).toBe('string')
            expect(state.triggerId).not.toBe(state.contentId)
        })
    })

    describe('bindings', () => {
        it('trigger aria-expanded reflects isExpanded', async () => {
            const { bindings, accordion } = createItemHost({}, { value: 'item-1' })
            expect(bindings.trigger['aria-expanded']).toBe(false)
            accordion.actions.expand('item-1')
            await nextTick()
            expect(bindings.trigger['aria-expanded']).toBe(true)
        })

        it('trigger data-state reflects isExpanded', async () => {
            const { bindings, accordion } = createItemHost({}, { value: 'item-1' })
            expect(bindings.trigger['data-state']).toBe('closed')
            accordion.actions.expand('item-1')
            await nextTick()
            expect(bindings.trigger['data-state']).toBe('open')
        })

        it('trigger onClick toggles item', async () => {
            const { state, bindings } = createItemHost({}, { value: 'item-1' })
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isExpanded).toBe(true)
        })

        it('trigger onClick does nothing when disabled', async () => {
            const { state, bindings } = createItemHost({}, { value: 'item-1', disabled: true })
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isExpanded).toBe(false)
        })

        it('content aria-labelledby matches trigger id', () => {
            const { state, bindings } = createItemHost({}, { value: 'item-1' })
            expect(bindings.content['aria-labelledby']).toBe(state.triggerId)
        })

        it('trigger aria-controls matches content id', () => {
            const { state, bindings } = createItemHost({}, { value: 'item-1' })
            expect(bindings.trigger['aria-controls']).toBe(state.contentId)
        })
    })

    describe('context', () => {
        it('useAccordionContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useAccordionContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useAccordionContext must be used within an Accordion')
        })
    })
})