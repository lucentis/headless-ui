import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useListbox } from './useListbox'
import { useListboxOption } from './useListboxOption'
import { provideListboxContext, useListboxContext } from './ListboxContext'

function createListboxHost(props: Parameters<typeof useListbox>[0] = {}) {
    let exposed: ReturnType<typeof useListbox>

    const Host = defineComponent({
        setup() { exposed = useListbox(props) },
        template: '<div />',
    })

    mount(Host)
    return {
        get state() { return exposed.state },
        get actions() { return exposed.actions },
        get bindings() { return exposed.bindings },
        get registerOption() { return exposed.registerOption },
        get unregisterOption() { return exposed.unregisterOption },
        get api() { return exposed },
    }
}

function createOptionHost(
    listboxProps: Parameters<typeof useListbox>[0] = {},
    optionProps: Parameters<typeof useListboxOption>[0],
) {
    let exposedListbox: ReturnType<typeof useListbox>
    let exposedOption: ReturnType<typeof useListboxOption>

    const Host = defineComponent({
        setup() {
            exposedListbox = useListbox(listboxProps)
            exposedOption = useListboxOption(optionProps, exposedListbox)
        },
        template: '<div />',
    })

    mount(Host)
    return {
        get listbox() { return exposedListbox },
        get state() { return exposedOption.state },
        get bindings() { return exposedOption.bindings },
    }
}

describe('useListbox', () => {
    describe('state', () => {
        it('value defaults to empty string in single mode', () => {
            const { state } = createListboxHost()
            expect(state.value).toBe('')
        })

        it('value defaults to empty array in multiple mode', () => {
            const { state } = createListboxHost({ multiple: true })
            expect(state.value).toEqual([])
        })

        it('reflects defaultValue', () => {
            const { state } = createListboxHost({ defaultValue: 'option-1' })
            expect(state.value).toBe('option-1')
        })

        it('reflects controlled value', async () => {
            const value = ref('option-1')
            const { state } = createListboxHost({ value })
            expect(state.value).toBe('option-1')
            value.value = 'option-2'
            await nextTick()
            expect(state.value).toBe('option-2')
        })

        it('highlightValue defaults to null', () => {
            const { state } = createListboxHost()
            expect(state.highlightValue).toBeNull()
        })

        it('isDisabled defaults to false', () => {
            const { state } = createListboxHost()
            expect(state.isDisabled).toBe(false)
        })

        it('multiple defaults to false', () => {
            const { state } = createListboxHost()
            expect(state.multiple).toBe(false)
        })

        it('orientation defaults to vertical', () => {
            const { state } = createListboxHost()
            expect(state.orientation).toBe('vertical')
        })
    })

    describe('actions — single mode', () => {
        it('select sets value', async () => {
            const { state, actions } = createListboxHost()
            actions.select('option-1')
            await nextTick()
            expect(state.value).toBe('option-1')
        })

        it('select replaces previous value', async () => {
            const { state, actions } = createListboxHost({ defaultValue: 'option-1' })
            actions.select('option-2')
            await nextTick()
            expect(state.value).toBe('option-2')
        })

        it('deselect clears value', async () => {
            const { state, actions } = createListboxHost({ defaultValue: 'option-1' })
            actions.deselect('option-1')
            await nextTick()
            expect(state.value).toBe('')
        })

        it('toggle selects unselected option', async () => {
            const { state, actions } = createListboxHost()
            actions.toggle('option-1')
            await nextTick()
            expect(state.value).toBe('option-1')
        })

        it('toggle deselects selected option', async () => {
            const { state, actions } = createListboxHost({ defaultValue: 'option-1' })
            actions.toggle('option-1')
            await nextTick()
            expect(state.value).toBe('')
        })

        it('isSelected returns true for selected option', () => {
            const { actions } = createListboxHost({ defaultValue: 'option-1' })
            expect(actions.isSelected('option-1')).toBe(true)
        })

        it('isSelected returns false for unselected option', () => {
            const { actions } = createListboxHost()
            expect(actions.isSelected('option-1')).toBe(false)
        })

        it('calls onValueChange', () => {
            const onValueChange = vi.fn()
            const { actions } = createListboxHost({ onValueChange })
            actions.select('option-1')
            expect(onValueChange).toHaveBeenCalledWith('option-1')
        })

        it('does not mutate state in controlled mode', async () => {
            const value = ref('option-1')
            const { actions } = createListboxHost({ value })
            actions.select('option-2')
            await nextTick()
            expect(actions.isSelected('option-1')).toBe(true)
        })

        it('select does nothing when disabled', async () => {
            const { state, actions } = createListboxHost({ disabled: true })
            actions.select('option-1')
            await nextTick()
            expect(state.value).toBe('')
        })
    })

    describe('actions — multiple mode', () => {
        it('select adds to array', async () => {
            const { actions } = createListboxHost({ multiple: true, defaultValue: ['option-1'] })
            actions.select('option-2')
            await nextTick()
            expect(actions.isSelected('option-1')).toBe(true)
            expect(actions.isSelected('option-2')).toBe(true)
        })

        it('deselect removes from array', async () => {
            const { actions } = createListboxHost({ multiple: true, defaultValue: ['option-1', 'option-2'] })
            actions.deselect('option-1')
            await nextTick()
            expect(actions.isSelected('option-1')).toBe(false)
            expect(actions.isSelected('option-2')).toBe(true)
        })

        it('select does not add duplicate', async () => {
            const { state, actions } = createListboxHost({ multiple: true, defaultValue: ['option-1'] })
            actions.select('option-1')
            await nextTick()
            expect((state.value as string[]).filter(v => v === 'option-1').length).toBe(1)
        })
    })

    describe('actions — navigation', () => {
        it('highlight sets highlightValue', async () => {
            const { state, actions } = createListboxHost()
            actions.highlight('option-1')
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })

        it('highlightFirst highlights first registered option', async () => {
            const { state, actions, registerOption } = createListboxHost()
            registerOption('option-1')
            registerOption('option-2')
            actions.highlightFirst()
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })

        it('highlightLast highlights last registered option', async () => {
            const { state, actions, registerOption } = createListboxHost()
            registerOption('option-1')
            registerOption('option-2')
            registerOption('option-3')
            actions.highlightLast()
            await nextTick()
            expect(state.highlightValue).toBe('option-3')
        })

        it('highlightNext moves to next option', async () => {
            const { state, actions, registerOption } = createListboxHost()
            registerOption('option-1')
            registerOption('option-2')
            actions.highlight('option-1')
            actions.highlightNext()
            await nextTick()
            expect(state.highlightValue).toBe('option-2')
        })

        it('highlightPrev moves to previous option', async () => {
            const { state, actions, registerOption } = createListboxHost()
            registerOption('option-1')
            registerOption('option-2')
            actions.highlight('option-2')
            actions.highlightPrev()
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })
    })

    describe('bindings.root', () => {
        it('role is listbox', () => {
            const { bindings } = createListboxHost()
            expect(bindings.root.role).toBe('listbox')
        })

        it('tabindex is 0', () => {
            const { bindings } = createListboxHost()
            expect(bindings.root.tabindex).toBe(0)
        })

        it('aria-multiselectable is true when multiple', () => {
            const { bindings } = createListboxHost({ multiple: true })
            expect(bindings.root['aria-multiselectable']).toBe(true)
        })

        it('aria-multiselectable is undefined when single', () => {
            const { bindings } = createListboxHost()
            expect(bindings.root['aria-multiselectable']).toBeUndefined()
        })

        it('aria-disabled is true when disabled', () => {
            const { bindings } = createListboxHost({ disabled: true })
            expect(bindings.root['aria-disabled']).toBe(true)
        })

        it('aria-orientation is undefined when vertical', () => {
            const { bindings } = createListboxHost({ orientation: 'vertical' })
            expect(bindings.root['aria-orientation']).toBeUndefined()
        })

        it('aria-orientation is horizontal when horizontal', () => {
            const { bindings } = createListboxHost({ orientation: 'horizontal' })
            expect(bindings.root['aria-orientation']).toBe('horizontal')
        })

        it('ArrowDown highlights next option', async () => {
            const { state, bindings, registerOption } = createListboxHost()
            registerOption('option-1')
            registerOption('option-2')
            bindings.root.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })

        it('ArrowUp highlights prev option', async () => {
            const { state, actions, bindings, registerOption } = createListboxHost()
            registerOption('option-1')
            registerOption('option-2')
            actions.highlight('option-2')
            bindings.root.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })

        it('Enter toggles active option', async () => {
            const { actions, bindings, registerOption } = createListboxHost()
            registerOption('option-1')
            actions.highlight('option-1')
            bindings.root.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
            await nextTick()
            expect(actions.isSelected('option-1')).toBe(true)
        })

        it('Space toggles active option', async () => {
            const { actions, bindings, registerOption } = createListboxHost()
            registerOption('option-1')
            actions.highlight('option-1')
            bindings.root.onKeydown(new KeyboardEvent('keydown', { key: ' ' }))
            await nextTick()
            expect(actions.isSelected('option-1')).toBe(true)
        })

        it('ArrowLeft highlights prev in horizontal mode', async () => {
            const { state, actions, bindings, registerOption } = createListboxHost({ orientation: 'horizontal' })
            registerOption('option-1')
            registerOption('option-2')
            actions.highlight('option-2')
            bindings.root.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })

        it('ArrowRight highlights next in horizontal mode', async () => {
            const { state, bindings, registerOption } = createListboxHost({ orientation: 'horizontal' })
            registerOption('option-1')
            registerOption('option-2')
            bindings.root.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
            await nextTick()
            expect(state.highlightValue).toBe('option-1')
        })
    })

    describe('context', () => {
        it('useListboxContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useListboxContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useListboxContext must be used within a Listbox')
        })
    })
})

describe('useListboxOption', () => {
    describe('state', () => {
        it('isSelected reflects listbox state', async () => {
            const { state, listbox } = createOptionHost({}, { value: 'option-1' })
            expect(state.isSelected).toBe(false)
            listbox.actions.select('option-1')
            await nextTick()
            expect(state.isSelected).toBe(true)
        })

        it('isHighlighted reflects listbox state', async () => {
            const { state, listbox } = createOptionHost({}, { value: 'option-1' })
            expect(state.isHighlighted).toBe(false)
            listbox.actions.highlight('option-1')
            await nextTick()
            expect(state.isHighlighted).toBe(true)
        })

        it('isDisabled is true when listbox is disabled', () => {
            const { state } = createOptionHost({ disabled: true }, { value: 'option-1' })
            expect(state.isDisabled).toBe(true)
        })

        it('isDisabled is true when option is disabled', () => {
            const { state } = createOptionHost({}, { value: 'option-1', disabled: true })
            expect(state.isDisabled).toBe(true)
        })

        it('optionId matches listbox aria-activedescendant format', () => {
            const { state, listbox } = createOptionHost({}, { value: 'option-1' })
            expect(state.optionId).toBe(`${listbox.state.listboxId}-option-option-1`)
        })
    })

    describe('bindings', () => {
        it('aria-selected reflects isSelected', async () => {
            const { bindings, listbox } = createOptionHost({}, { value: 'option-1' })
            expect(bindings.root['aria-selected']).toBe(false)
            listbox.actions.select('option-1')
            await nextTick()
            expect(bindings.root['aria-selected']).toBe(true)
        })

        it('onClick toggles option', async () => {
            const { state, bindings } = createOptionHost({}, { value: 'option-1' })
            bindings.root.onClick()
            await nextTick()
            expect(state.isSelected).toBe(true)
        })

        it('onClick does nothing when disabled', async () => {
            const { state, bindings } = createOptionHost({}, { value: 'option-1', disabled: true })
            bindings.root.onClick()
            await nextTick()
            expect(state.isSelected).toBe(false)
        })
    })
})