import { describe, it, expect } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useHighlight } from './useHighlight'

function createHost(items: { value: string; disabled?: boolean }[] = []) {
    const registry = ref(items)
    let exposed: ReturnType<typeof useHighlight>

    const Host = defineComponent({
        setup() { exposed = useHighlight(registry) },
        template: '<div />',
    })

    mount(Host)
    return {
        registry,
        get highlightValue() { return exposed.highlightValue },
        get highlight() { return exposed.highlight },
        get highlightFirst() { return exposed.highlightFirst },
        get highlightLast() { return exposed.highlightLast },
        get highlightNext() { return exposed.highlightNext },
        get highlightPrev() { return exposed.highlightPrev },
        get isHighlighted() { return exposed.isHighlighted },
        get clearHighlight() { return exposed.clearHighlight },
    }
}

describe('useHighlight', () => {
    describe('initial state', () => {
        it('highlightValue defaults to null', () => {
            const { highlightValue } = createHost()
            expect(highlightValue.value).toBeNull()
        })
    })

    describe('highlight', () => {
        it('sets highlightValue', () => {
            const { highlight, highlightValue } = createHost([{ value: 'a' }])
            highlight('a')
            expect(highlightValue.value).toBe('a')
        })
    })

    describe('highlightFirst', () => {
        it('highlights first item', () => {
            const { highlightFirst, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlightFirst()
            expect(highlightValue.value).toBe('a')
        })

        it('skips disabled items', () => {
            const { highlightFirst, highlightValue } = createHost([
                { value: 'a', disabled: true },
                { value: 'b' },
            ])
            highlightFirst()
            expect(highlightValue.value).toBe('b')
        })

        it('does nothing when all items disabled', () => {
            const { highlightFirst, highlightValue } = createHost([
                { value: 'a', disabled: true },
            ])
            highlightFirst()
            expect(highlightValue.value).toBeNull()
        })
    })

    describe('highlightLast', () => {
        it('highlights last item', () => {
            const { highlightLast, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlightLast()
            expect(highlightValue.value).toBe('b')
        })

        it('skips disabled items', () => {
            const { highlightLast, highlightValue } = createHost([
                { value: 'a' },
                { value: 'b', disabled: true },
            ])
            highlightLast()
            expect(highlightValue.value).toBe('a')
        })
    })

    describe('highlightNext', () => {
        it('highlights first item when highlightValue is null', () => {
            const { highlightNext, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlightNext()
            expect(highlightValue.value).toBe('a')
        })

        it('moves to next item', () => {
            const { highlight, highlightNext, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlight('a')
            highlightNext()
            expect(highlightValue.value).toBe('b')
        })

        it('does not go past last item', () => {
            const { highlight, highlightNext, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlight('b')
            highlightNext()
            expect(highlightValue.value).toBe('b')
        })

        it('skips disabled items', () => {
            const { highlight, highlightNext, highlightValue } = createHost([
                { value: 'a' },
                { value: 'b', disabled: true },
                { value: 'c' },
            ])
            highlight('a')
            highlightNext()
            expect(highlightValue.value).toBe('c')
        })

        it('no-op when highlight is stale', async () => {
            const { highlight, highlightNext, highlightValue, registry } = createHost([
                { value: 'a' },
                { value: 'b' },
            ])
            highlight('b')
            registry.value = [{ value: 'a' }]
            await nextTick()
            highlightNext()
            expect(highlightValue.value).toBe('b')
        })
    })

    describe('highlightPrev', () => {
        it('highlights last item when highlightValue is null', () => {
            const { highlightPrev, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlightPrev()
            expect(highlightValue.value).toBe('b')
        })

        it('moves to previous item', () => {
            const { highlight, highlightPrev, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlight('b')
            highlightPrev()
            expect(highlightValue.value).toBe('a')
        })

        it('does not go past first item', () => {
            const { highlight, highlightPrev, highlightValue } = createHost([{ value: 'a' }, { value: 'b' }])
            highlight('a')
            highlightPrev()
            expect(highlightValue.value).toBe('a')
        })

        it('skips disabled items', () => {
            const { highlight, highlightPrev, highlightValue } = createHost([
                { value: 'a' },
                { value: 'b', disabled: true },
                { value: 'c' },
            ])
            highlight('c')
            highlightPrev()
            expect(highlightValue.value).toBe('a')
        })

        it('no-op when highlight is stale', async () => {
            const { highlight, highlightPrev, highlightValue, registry } = createHost([
                { value: 'a' },
                { value: 'b' },
            ])
            highlight('a')
            registry.value = [{ value: 'b' }]
            await nextTick()
            highlightPrev()
            expect(highlightValue.value).toBe('a')
        })
    })

    describe('isHighlighted', () => {
        it('returns true for highlighted value', () => {
            const { highlight, isHighlighted } = createHost([{ value: 'a' }])
            highlight('a')
            expect(isHighlighted('a')).toBe(true)
        })

        it('returns false for non-highlighted value', () => {
            const { highlight, isHighlighted } = createHost([{ value: 'a' }, { value: 'b' }])
            highlight('a')
            expect(isHighlighted('b')).toBe(false)
        })
    })

    describe('clearHighlight', () => {
        it('resets highlightValue to null', () => {
            const { highlight, clearHighlight, highlightValue } = createHost([{ value: 'a' }])
            highlight('a')
            clearHighlight()
            expect(highlightValue.value).toBeNull()
        })
    })
})