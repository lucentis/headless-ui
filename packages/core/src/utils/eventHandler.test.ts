import { describe, it, expect, vi } from 'vitest'
import { composeHandlers } from './eventHandler'

describe('composeHandlers', () => {
    it('calls userHandler first then internalHandler', () => {
        const order: string[] = []
        const userHandler = vi.fn(() => order.push('user'))
        const internalHandler = vi.fn(() => order.push('internal'))

        const composed = composeHandlers(userHandler, internalHandler)
        composed(new MouseEvent('click'))

        expect(order).toEqual(['user', 'internal'])
    })

    it('calls internalHandler when userHandler is undefined', () => {
        const internalHandler = vi.fn()
        const composed = composeHandlers(undefined, internalHandler)
        composed(new MouseEvent('click'))
        expect(internalHandler).toHaveBeenCalledTimes(1)
    })

    it('does not call internalHandler when event.preventDefault() was called by userHandler', () => {
        const internalHandler = vi.fn()
        const userHandler = (event: MouseEvent) => event.preventDefault()

        const composed = composeHandlers(userHandler, internalHandler)
        const event = new MouseEvent('click', { cancelable: true })
        composed(event)

        expect(internalHandler).not.toHaveBeenCalled()
    })

    it('calls internalHandler when event is undefined', () => {
        const internalHandler = vi.fn()
        const composed = composeHandlers(undefined, internalHandler)
        composed(undefined)
        expect(internalHandler).toHaveBeenCalledTimes(1)
    })

    it('still calls internalHandler when userHandler does not prevent default', () => {
        const internalHandler = vi.fn()
        const userHandler = vi.fn()

        const composed = composeHandlers(userHandler, internalHandler)
        composed(new MouseEvent('click'))

        expect(internalHandler).toHaveBeenCalledTimes(1)
    })
})