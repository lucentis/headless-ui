<script setup lang="ts">
import { toRef } from 'vue'
import { useAlert } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = withDefaults(
    defineProps<{
        open?: boolean
        defaultOpen?: boolean
        role?: 'alert' | 'status'
        onOpenChange?: (value: boolean) => void
    }>(),
    {
        // Vue casts an absent Boolean prop to false, which would force controlled mode
        open: undefined,
        defaultOpen: true,
        role: 'status',
    },
)

const { state, actions, bindings } = useAlert({
    // the mode is fixed at setup, so the value is never undefined while controlled
    open: props.open === undefined ? undefined : toRef(() => props.open as boolean),
    defaultOpen: props.defaultOpen,
    role: toRef(props, 'role'),
    onOpenChange: props.onOpenChange,
})

defineExpose({
    open: actions.open,
    close: actions.close,
})
</script>

<template>
    <div
        v-if="state.isPresent"
        v-bind="{
            ...bindings.root,
            ...$attrs,
        }"
    >
        <slot :is-open="state.isOpen" :is-present="state.isPresent" :open="actions.open" :close="actions.close" />
    </div>
</template>
