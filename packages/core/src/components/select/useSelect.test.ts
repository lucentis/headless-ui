import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useSelect } from './useSelect'
import { useSelectOption } from './useSelectOption'
import { provideSelectContext, useSelectContext } from './selectContext'

function createSelectHost(props: Parameters<typeof useSelect>[0] = {}) {
    let exposed: ReturnType<typeof useSelect>

    const Host = defineComponent({
        setup() { exposed = useSelect(props) },
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
        get registerOption() { return exposed.registerOption },
        get unregisterOption() { return exposed.unregisterOption },
        get api() { return exposed },
    }
}

function createOptionHost(
    selectProps: Parameters<typeof useSelect>[0] = {},
    optionProps: Parameters<typeof useSelectOption>[0],
) {
    let exposedSelect: ReturnType<typeof useSelect>
    let exposedOption: ReturnType<typeof useSelectOption>

    const Host = defineComponent({
        setup() {
            exposedSelect = useSelect(selectProps)
            exposedOption = useSelectOption(optionProps, exposedSelect)
        },
        template: '<div />',
    })

    mount(Host, { attachTo: document.body })
    return {
        get select() { return exposedSelect },
        get state() { return exposedOption.state },
        get bindings() { return exposedOption.bindings },
    }
}

describe('useSelect', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('state', () => {
        it('value defaults to empty string', () => {
            const { state, wrapper } = createSelectHost()
            expect(state.value).toBe('')
            wrapper.unmount()
        })

        it('selectedLabel defaults to null', () => {
            const { state, wrapper } = createSelectHost()
            expect(state.selectedLabel).toBeNull()
            wrapper.unmount()
        })

        it('highlightValue defaults to null', () => {
            const { state, wrapper } = createSelectHost()
            expect(state.highlightValue).toBeNull()
            wrapper.unmount()
        })

        it('isOpen defaults to false', () => {
            const { state, wrapper } = createSelectHost()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('isDisabled defaults to false', () => {
            const { state, wrapper } = createSelectHost()
            expect(state.isDisabled).toBe(false)
            wrapper.unmount()
        })

        it('placeholder reflects prop', () => {
            const { state, wrapper } = createSelectHost({ placeholder: 'Select...' })
            expect(state.placeholder).toBe('Select...')
            wrapper.unmount()
        })

        it('reflects defaultValue', () => {
            const { state, wrapper } = createSelectHost({ defaultValue: 'fr' })
            expect(state.value).toBe('fr')
            wrapper.unmount()
        })

        it('reflects controlled value', async () => {
            const value = ref('fr')
            const { state, wrapper } = createSelectHost({ value })
            expect(state.value).toBe('fr')
            value.value = 'en'
            await nextTick()
            expect(state.value).toBe('en')
            wrapper.unmount()
        })

        it('selectedLabel reflects registered option label', async () => {
            const { state, registerOption, wrapper } = createSelectHost({ defaultValue: 'fr' })
            registerOption('fr', 'French')
            await nextTick()
            expect(state.selectedLabel).toBe('French')
            wrapper.unmount()
        })
    })

    describe('actions', () => {
        it('open sets isOpen to true', async () => {
            const { state, actions, wrapper } = createSelectHost()
            actions.open()
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })

        it('close sets isOpen to false', async () => {
            const { state, actions, wrapper } = createSelectHost({ defaultOpen: true })
            actions.close()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('select sets value and closes', async () => {
            const { state, actions, wrapper } = createSelectHost({ defaultOpen: true })
            actions.select('fr')
            await nextTick()
            expect(state.value).toBe('fr')
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('select does nothing when disabled', async () => {
            const { state, actions, wrapper } = createSelectHost({ disabled: true })
            actions.select('fr')
            await nextTick()
            expect(state.value).toBe('')
            wrapper.unmount()
        })

        it('close resets highlightValue', async () => {
            const { state, actions, wrapper } = createSelectHost({ defaultOpen: true })
            actions.highlight('fr')
            await nextTick()
            actions.close()
            await nextTick()
            expect(state.highlightValue).toBeNull()
            wrapper.unmount()
        })

        it('calls onValueChange on select', () => {
            const onValueChange = vi.fn()
            const { actions, wrapper } = createSelectHost({ onValueChange })
            actions.select('fr')
            expect(onValueChange).toHaveBeenCalledWith('fr')
            wrapper.unmount()
        })

        it('isSelected returns true for selected value', () => {
            const { actions, wrapper } = createSelectHost({ defaultValue: 'fr' })
            expect(actions.isSelected('fr')).toBe(true)
            wrapper.unmount()
        })

        it('isHighlight returns true for highlighted value', async () => {
            const { actions, wrapper } = createSelectHost()
            actions.highlight('fr')
            await nextTick()
            expect(actions.isHighlight('fr')).toBe(true)
            wrapper.unmount()
        })

        it('highlightNext moves to next registered option', async () => {
            const { state, actions, registerOption, wrapper } = createSelectHost()
            registerOption('fr', 'French')
            registerOption('en', 'English')
            actions.highlightNext()
            await nextTick()
            expect(state.highlightValue).toBe('fr')
            wrapper.unmount()
        })

        it('highlightPrev moves to previous registered option', async () => {
            const { state, actions, registerOption, wrapper } = createSelectHost()
            registerOption('fr', 'French')
            registerOption('en', 'English')
            actions.highlight('en')
            actions.highlightPrev()
            await nextTick()
            expect(state.highlightValue).toBe('fr')
            wrapper.unmount()
        })
    })

    describe('bindings.trigger', () => {
        it('role is combobox', () => {
            const { bindings, wrapper } = createSelectHost()
            expect(bindings.trigger.role).toBe('combobox')
            wrapper.unmount()
        })

        it('aria-haspopup is listbox', () => {
            const { bindings, wrapper } = createSelectHost()
            expect(bindings.trigger['aria-haspopup']).toBe('listbox')
            wrapper.unmount()
        })

        it('aria-expanded reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createSelectHost()
            expect(bindings.trigger['aria-expanded']).toBe(false)
            actions.open()
            await nextTick()
            expect(bindings.trigger['aria-expanded']).toBe(true)
            wrapper.unmount()
        })

        it('data-state reflects isOpen', async () => {
            const { bindings, actions, wrapper } = createSelectHost()
            expect(bindings.trigger['data-state']).toBe('closed')
            actions.open()
            await nextTick()
            expect(bindings.trigger['data-state']).toBe('open')
            wrapper.unmount()
        })

        it('onClick toggles select', async () => {
            const { state, bindings, wrapper } = createSelectHost()
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isOpen).toBe(true)
            wrapper.unmount()
        })

        it('onClick does nothing when disabled', async () => {
            const { state, bindings, wrapper } = createSelectHost({ disabled: true })
            bindings.trigger.onClick()
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('bindings.content', () => {
        it('role is listbox', () => {
            const { bindings, wrapper } = createSelectHost()
            expect(bindings.content.role).toBe('listbox')
            wrapper.unmount()
        })

        it('tabindex is -1', () => {
            const { bindings, wrapper } = createSelectHost()
            expect(bindings.content.tabindex).toBe(-1)
            wrapper.unmount()
        })

        it('aria-activedescendant reflects highlightValue', async () => {
            const { bindings, actions, state, wrapper } = createSelectHost()
            expect(bindings.content['aria-activedescendant']).toBeUndefined()
            actions.highlight('fr')
            await nextTick()
            expect(bindings.content['aria-activedescendant']).toBe(`${state.contentId}-option-fr`)
            wrapper.unmount()
        })

        it('ArrowDown highlights next option', async () => {
            const { state, bindings, registerOption, wrapper } = createSelectHost()
            registerOption('fr', 'French')
            registerOption('en', 'English')
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            await nextTick()
            expect(state.highlightValue).toBe('fr')
            wrapper.unmount()
        })

        it('Enter selects highlighted option and closes', async () => {
            const { state, actions, bindings, registerOption, wrapper } = createSelectHost({ defaultOpen: true })
            registerOption('fr', 'French')
            actions.highlight('fr')
            bindings.content.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
            await nextTick()
            expect(state.value).toBe('fr')
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })

        it('Tab closes select', async () => {
            const { state, actions, bindings, wrapper } = createSelectHost()
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
            const { state, actions, wrapper } = createSelectHost()
            actions.open()
            await nextTick()
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
            await nextTick()
            expect(state.isOpen).toBe(false)
            wrapper.unmount()
        })
    })

    describe('context', () => {
        it('useSelectContext throws outside provider', () => {
            const Host = defineComponent({
                setup() { useSelectContext() },
                template: '<div />',
            })
            expect(() => mount(Host)).toThrow('[headless-ui] useSelectContext must be used within a Select')
        })
    })
})

describe('useSelectOption', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('state', () => {
        it('isSelected reflects select state', async () => {
            const { state, select } = createOptionHost({}, { value: 'fr', label: 'French' })
            expect(state.isSelected).toBe(false)
            select.actions.select('fr')
            await nextTick()
            expect(state.isSelected).toBe(true)
        })

        it('isHighlight reflects select state', async () => {
            const { state, select } = createOptionHost({}, { value: 'fr', label: 'French' })
            expect(state.isHighlight).toBe(false)
            select.actions.highlight('fr')
            await nextTick()
            expect(state.isHighlight).toBe(true)
        })

        it('isDisabled is true when select is disabled', () => {
            const { state } = createOptionHost({ disabled: true }, { value: 'fr', label: 'French' })
            expect(state.isDisabled).toBe(true)
        })

        it('isDisabled is true when option is disabled', () => {
            const { state } = createOptionHost({}, { value: 'fr', label: 'French', disabled: true })
            expect(state.isDisabled).toBe(true)
        })

        it('optionId matches aria-activedescendant format', () => {
            const { state, select } = createOptionHost({}, { value: 'fr', label: 'French' })
            expect(state.optionId).toBe(`${select.state.contentId}-option-fr`)
        })

        it('registers label on mount', async () => {
            const { select } = createOptionHost({ defaultValue: 'fr' }, { value: 'fr', label: 'French' })
            await nextTick()
            expect(select.state.selectedLabel).toBe('French')
        })
    })

    describe('bindings', () => {
        it('role is option', () => {
            const { bindings } = createOptionHost({}, { value: 'fr', label: 'French' })
            expect(bindings.role).toBe('option')
        })

        it('aria-selected reflects isSelected', async () => {
            const { bindings, select } = createOptionHost({}, { value: 'fr', label: 'French' })
            expect(bindings['aria-selected']).toBe(false)
            select.actions.select('fr')
            await nextTick()
            expect(bindings['aria-selected']).toBe(true)
        })

        it('data-highlighted is set when highlighted', async () => {
            const { bindings, select } = createOptionHost({}, { value: 'fr', label: 'French' })
            select.actions.highlight('fr')
            await nextTick()
            expect(bindings['data-highlighted']).toBe('')
        })

        it('onClick selects option and closes', async () => {
            const { bindings, select } = createOptionHost({ defaultOpen: true }, { value: 'fr', label: 'French' })
            bindings.onClick()
            await nextTick()
            expect(select.state.value).toBe('fr')
            expect(select.state.isOpen).toBe(false)
        })

        it('onClick does nothing when disabled', async () => {
            const { bindings, select } = createOptionHost({ defaultOpen: true }, { value: 'fr', label: 'French', disabled: true })
            bindings.onClick()
            await nextTick()
            expect(select.state.value).toBe('')
            expect(select.state.isOpen).toBe(true)
        })

        it('onMouseenter highlights option', async () => {
            const { bindings, select } = createOptionHost({}, { value: 'fr', label: 'French' })
            bindings.onMouseenter()
            await nextTick()
            expect(select.state.highlightValue).toBe('fr')
        })
    })
})