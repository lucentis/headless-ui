import { describe, it, expect, vi } from 'vitest'
import { useArrowNavigation } from './useArrowNavigation'

function createOptions(overrides: Partial<Parameters<typeof useArrowNavigation>[0]> = {}) {
    return {
        onNext: vi.fn(),
        onPrev: vi.fn(),
        onFirst: vi.fn(),
        onLast: vi.fn(),
        ...overrides,
    }
}

function dispatch(key: string, options: Parameters<typeof useArrowNavigation>[0]) {
    const { onKeydown } = useArrowNavigation(options)
    const event = new KeyboardEvent('keydown', { key, bubbles: true })
    const preventDefault = vi.spyOn(event, 'preventDefault')
    onKeydown(event)
    return { event, preventDefault }
}

describe('useArrowNavigation', () => {
    describe('vertical orientation (default)', () => {
        it('ArrowDown calls onNext', () => {
            const options = createOptions()
            dispatch('ArrowDown', options)
            expect(options.onNext).toHaveBeenCalledTimes(1)
        })

        it('ArrowUp calls onPrev', () => {
            const options = createOptions()
            dispatch('ArrowUp', options)
            expect(options.onPrev).toHaveBeenCalledTimes(1)
        })

        it('ArrowRight does nothing in vertical mode', () => {
            const options = createOptions()
            dispatch('ArrowRight', options)
            expect(options.onNext).not.toHaveBeenCalled()
        })

        it('ArrowLeft does nothing in vertical mode', () => {
            const options = createOptions()
            dispatch('ArrowLeft', options)
            expect(options.onPrev).not.toHaveBeenCalled()
        })
    })

    describe('horizontal orientation', () => {
        it('ArrowRight calls onNext', () => {
            const options = createOptions({ orientation: 'horizontal' })
            dispatch('ArrowRight', options)
            expect(options.onNext).toHaveBeenCalledTimes(1)
        })

        it('ArrowLeft calls onPrev', () => {
            const options = createOptions({ orientation: 'horizontal' })
            dispatch('ArrowLeft', options)
            expect(options.onPrev).toHaveBeenCalledTimes(1)
        })

        it('ArrowDown does nothing in horizontal mode', () => {
            const options = createOptions({ orientation: 'horizontal' })
            dispatch('ArrowDown', options)
            expect(options.onNext).not.toHaveBeenCalled()
        })

        it('ArrowUp does nothing in horizontal mode', () => {
            const options = createOptions({ orientation: 'horizontal' })
            dispatch('ArrowUp', options)
            expect(options.onPrev).not.toHaveBeenCalled()
        })
    })

    describe('Home and End', () => {
        it('Home calls onFirst', () => {
            const options = createOptions()
            dispatch('Home', options)
            expect(options.onFirst).toHaveBeenCalledTimes(1)
        })

        it('End calls onLast', () => {
            const options = createOptions()
            dispatch('End', options)
            expect(options.onLast).toHaveBeenCalledTimes(1)
        })

        it('Home calls onFirst in horizontal mode too', () => {
            const options = createOptions({ orientation: 'horizontal' })
            dispatch('Home', options)
            expect(options.onFirst).toHaveBeenCalledTimes(1)
        })
    })

    describe('Enter and Space', () => {
        it('Enter calls onEnter when provided', () => {
            const onEnter = vi.fn()
            const options = createOptions({ onEnter })
            dispatch('Enter', options)
            expect(onEnter).toHaveBeenCalledTimes(1)
        })

        it('Space calls onSpace when provided', () => {
            const onSpace = vi.fn()
            const options = createOptions({ onSpace })
            dispatch(' ', options)
            expect(onSpace).toHaveBeenCalledTimes(1)
        })

        it('Enter does nothing when onEnter not provided', () => {
            const options = createOptions()
            expect(() => dispatch('Enter', options)).not.toThrow()
        })

        it('Space does nothing when onSpace not provided', () => {
            const options = createOptions()
            expect(() => dispatch(' ', options)).not.toThrow()
        })
    })

    describe('preventDefault', () => {
        it('calls preventDefault on ArrowDown', () => {
            const options = createOptions()
            const { preventDefault } = dispatch('ArrowDown', options)
            expect(preventDefault).toHaveBeenCalled()
        })

        it('calls preventDefault on Home', () => {
            const options = createOptions()
            const { preventDefault } = dispatch('Home', options)
            expect(preventDefault).toHaveBeenCalled()
        })

        it('calls preventDefault on Enter when onEnter provided', () => {
            const options = createOptions({ onEnter: vi.fn() })
            const { preventDefault } = dispatch('Enter', options)
            expect(preventDefault).toHaveBeenCalled()
        })

        it('does not call preventDefault on Enter when onEnter not provided', () => {
            const options = createOptions()
            const { preventDefault } = dispatch('Enter', options)
            expect(preventDefault).not.toHaveBeenCalled()
        })

        it('does not call preventDefault on unhandled key', () => {
            const options = createOptions()
            const { preventDefault } = dispatch('Tab', options)
            expect(preventDefault).not.toHaveBeenCalled()
        })
    })
})