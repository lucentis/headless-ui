import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useOpenState } from './useOpenState'

function createHost(options: Parameters<typeof useOpenState>[0] = {}) {
    let exposed: ReturnType<typeof useOpenState>

    const Host = defineComponent({
        setup() { exposed = useOpenState(options) },
        template: '<div />',
    })

    mount(Host)
    return {
        get isOpen() { return exposed.isOpen },
        get isPresent() { return exposed.isPresent },
        get open() { return exposed.open },
        get close() { return exposed.close },
        get toggle() { return exposed.toggle },
        get setOpen() { return exposed.setOpen },
    }
}

describe('useOpenState', () => {
    describe('initial state', () => {
        it('isOpen defaults to false', () => {
            const { isOpen } = createHost()
            expect(isOpen.value).toBe(false)
        })

        it('isOpen respects defaultOpen', () => {
            const { isOpen } = createHost({ defaultOpen: true })
            expect(isOpen.value).toBe(true)
        })

        it('isPresent mirrors isOpen', () => {
            const { isOpen, isPresent } = createHost({ defaultOpen: true })
            expect(isPresent.value).toBe(isOpen.value)
        })

        it('reflects controlled open ref', async () => {
            const open = ref(false)
            const { isOpen } = createHost({ open })
            open.value = true
            await nextTick()
            expect(isOpen.value).toBe(true)
        })
    })

    describe('actions', () => {
        it('open sets isOpen to true', async () => {
            const { isOpen, open } = createHost()
            open()
            await nextTick()
            expect(isOpen.value).toBe(true)
        })

        it('close sets isOpen to false', async () => {
            const { isOpen, close } = createHost({ defaultOpen: true })
            close()
            await nextTick()
            expect(isOpen.value).toBe(false)
        })

        it('toggle flips isOpen', async () => {
            const { isOpen, toggle } = createHost()
            toggle()
            await nextTick()
            expect(isOpen.value).toBe(true)
            toggle()
            await nextTick()
            expect(isOpen.value).toBe(false)
        })

        it('setOpen sets an explicit value', async () => {
            const { isOpen, setOpen } = createHost()
            setOpen(true)
            await nextTick()
            expect(isOpen.value).toBe(true)
        })

        it('calls onOpenChange on open', () => {
            const onOpenChange = vi.fn()
            const { open } = createHost({ onOpenChange })
            open()
            expect(onOpenChange).toHaveBeenCalledWith(true)
        })

        it('calls onOpenChange on close', () => {
            const onOpenChange = vi.fn()
            const { close } = createHost({ defaultOpen: true, onOpenChange })
            close()
            expect(onOpenChange).toHaveBeenCalledWith(false)
        })

        it('does not mutate state in controlled mode', async () => {
            const open = ref(false)
            const { isOpen, toggle } = createHost({ open })
            toggle()
            await nextTick()
            expect(isOpen.value).toBe(false)
        })
    })
})