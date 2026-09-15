import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useRegistry } from './useRegistry'

interface TestItem {
    value: string
    id: string
    disabled: boolean
}

function createHost() {
    let exposed: ReturnType<typeof useRegistry<TestItem>>

    const Host = defineComponent({
        setup() { exposed = useRegistry<TestItem>() },
        template: '<div />',
    })

    mount(Host)
    return {
        get registry() { return exposed.registry },
        get register() { return exposed.register },
        get unregister() { return exposed.unregister },
        get updateItem() { return exposed.updateItem },
        get getItem() { return exposed.getItem },
    }
}

describe('useRegistry', () => {
    describe('register', () => {
        it('adds an item to the registry', () => {
            const { register, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            expect(registry.value).toHaveLength(1)
            expect(registry.value[0].value).toBe('a')
        })

        it('preserves insertion order', () => {
            const { register, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            register({ value: 'b', id: 'id-b', disabled: false })
            register({ value: 'c', id: 'id-c', disabled: false })
            expect(registry.value.map(i => i.value)).toEqual(['a', 'b', 'c'])
        })

        it('does not add duplicate values', () => {
            const { register, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            register({ value: 'a', id: 'id-a-2', disabled: false })
            expect(registry.value).toHaveLength(1)
        })
    })

    describe('unregister', () => {
        it('removes item by value', () => {
            const { register, unregister, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            register({ value: 'b', id: 'id-b', disabled: false })
            unregister('a')
            expect(registry.value).toHaveLength(1)
            expect(registry.value[0].value).toBe('b')
        })

        it('does nothing for unknown value', () => {
            const { register, unregister, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            unregister('unknown')
            expect(registry.value).toHaveLength(1)
        })
    })

    describe('updateItem', () => {
        it('updates a field on an existing item', () => {
            const { register, updateItem, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            updateItem('a', { disabled: true })
            expect(registry.value[0].disabled).toBe(true)
        })

        it('preserves other fields when updating', () => {
            const { register, updateItem, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            updateItem('a', { disabled: true })
            expect(registry.value[0].id).toBe('id-a')
            expect(registry.value[0].value).toBe('a')
        })

        it('does nothing for unknown value', () => {
            const { register, updateItem, registry } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            updateItem('unknown', { disabled: true })
            expect(registry.value[0].disabled).toBe(false)
        })
    })

    describe('getItem', () => {
        it('returns item by value', () => {
            const { register, getItem } = createHost()
            register({ value: 'a', id: 'id-a', disabled: false })
            expect(getItem('a')?.id).toBe('id-a')
        })

        it('returns undefined for unknown value', () => {
            const { getItem } = createHost()
            expect(getItem('unknown')).toBeUndefined()
        })
    })
})