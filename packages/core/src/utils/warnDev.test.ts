import { describe, it, expect, vi, afterEach } from 'vitest'
import { warnDev } from './warnDev'

describe('warnDev', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllEnvs()
    })

    it('logs a prefixed warning outside production', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        warnDev('useX()', 'something is wrong')
        expect(spy).toHaveBeenCalledWith('[Headless UI] useX(): something is wrong')
    })

    it('does nothing in production', () => {
        vi.stubEnv('NODE_ENV', 'production')
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        warnDev('useX()', 'something is wrong')
        expect(spy).not.toHaveBeenCalled()
    })
})
