import { describe, it, expect, beforeEach } from 'vitest'
import { useId } from './useId'

// useId uses a module-level counter that persists between tests.
// We cannot reset it, so we test relative uniqueness instead of exact values.

describe('useId', () => {
    it('returns a ref containing a string', () => {
        const id = useId()
        expect(typeof id.value).toBe('string')
    })

    it('generates unique ids across calls', () => {
        const a = useId()
        const b = useId()
        expect(a.value).not.toBe(b.value)
    })

    it('uses the provided prefix', () => {
        const id = useId('dialog-trigger')
        expect(id.value.startsWith('dialog-trigger-')).toBe(true)
    })

    it('falls back to config idPrefix when no prefix provided', () => {
        const id = useId()
        // default config idPrefix is 'headless'
        expect(id.value.startsWith('headless-')).toBe(true)
    })

    it('returns a readonly ref — writing throws', () => {
        const id = useId()
        expect(() => {
        // @ts-expect-error — testing runtime readonly enforcement
        id.value = 'overridden'
        }).toThrow()
    })
})