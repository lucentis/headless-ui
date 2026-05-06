import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { usePresence } from './usePresence'
import { provideConfig } from '../config'

function createHost(initialOpen: boolean, animationDuration = 0) {
    const isOpen = ref(initialOpen)
    let exposed: ReturnType<typeof usePresence>

    const Host = defineComponent({
        setup() {
            exposed = usePresence(isOpen)
        },
        template: '<div />',
    })

    // provide a config with the given animationDuration
    const wrapper = mount(Host, {
        global: {
            provide: {
                // matches the InjectionKey used in ConfigContext
            },
        },
    })

    return { wrapper, isOpen, get isPresent() { return exposed } }
}

// minimal host that injects a custom animationDuration via provideConfig
function createHostWithDuration(initialOpen: boolean, duration: number) {
    const isOpen = ref(initialOpen)
    let exposed: ReturnType<typeof usePresence>

    const Host = defineComponent({
        setup() {
            exposed = usePresence(isOpen, duration)
        },
        template: '<div />',
    })

    const wrapper = mount(Host)
    return { wrapper, isOpen, get isPresent() { return exposed } }
}

describe('usePresence', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    describe('animationDuration = 0 (default)', () => {
        it('isPresent mirrors isOpen initially when false', () => {
            const { isPresent } = createHost(false)
            expect(isPresent.value).toBe(false)
        })

        it('isPresent mirrors isOpen initially when true', () => {
            const { isPresent } = createHost(true)
            expect(isPresent.value).toBe(true)
        })

        it('isPresent becomes true immediately when isOpen goes true', async () => {
            const { isOpen, isPresent } = createHost(false)
            isOpen.value = true
            await nextTick()
            expect(isPresent.value).toBe(true)
        })

        it('isPresent becomes false immediately when isOpen goes false', async () => {
            const { isOpen, isPresent } = createHost(true)
            isOpen.value = false
            await nextTick()
            expect(isPresent.value).toBe(false)
        })
    })

    describe('animationDuration > 0', () => {
        it('isPresent becomes true immediately when isOpen goes true', async () => {
            const isOpen = ref(false)
            let exposed: ReturnType<typeof usePresence>

            const Host = defineComponent({
                setup() {
                    exposed = usePresence(isOpen, 300)
                },
                template: '<div />',
            })

            const wrapper = mount(Host)
            isOpen.value = true
            await nextTick()
            expect(exposed!.value).toBe(true)
            wrapper.unmount()
        })

        it('isPresent stays true immediately after isOpen goes false', async () => {
            const isOpen = ref(true)
            let exposed: ReturnType<typeof usePresence>

            const Host = defineComponent({
                setup() {
                    exposed = usePresence(isOpen, 300)
                },
                template: '<div />',
            })

            const wrapper = mount(Host)
            isOpen.value = false
            await nextTick()
            expect(exposed!.value).toBe(true)
            wrapper.unmount()
        })

        it('isPresent goes false after animationDuration has elapsed', async () => {
            const isOpen = ref(true)
            let exposed: ReturnType<typeof usePresence>

            const Host = defineComponent({
                setup() {
                    exposed = usePresence(isOpen, 200)
                },
                template: '<div />',
            })
            
            const wrapper = mount(Host)
            isOpen.value = false
            await nextTick()

            vi.advanceTimersByTime(300)
            await nextTick()

            expect(exposed!.value).toBe(false)
            wrapper.unmount()
        })

        it('cancels the exit timer if isOpen goes true again before it fires', async () => {
            const isOpen = ref(true)
            let exposed: ReturnType<typeof usePresence>

            const Host = defineComponent({
                setup() {
                    exposed = usePresence(isOpen, 300)
                },
                template: '<div />',
            })

            const wrapper = mount(Host)
            isOpen.value = false
            await nextTick()

            vi.advanceTimersByTime(150)
            isOpen.value = true
            await nextTick()

            vi.advanceTimersByTime(300)
            await nextTick()

            expect(exposed!.value).toBe(true)
            wrapper.unmount()
        })
    })
})