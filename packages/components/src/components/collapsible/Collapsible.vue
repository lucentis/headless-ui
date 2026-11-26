<script setup lang="ts">
import { toRef } from 'vue'
import { provideCollapsibleContext, useCollapsible } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = withDefaults(
    defineProps<{
        open?: boolean
        defaultOpen?: boolean
        disabled?: boolean
        onOpenChange?: (value: boolean) => void
    }>(),
    {
        // Preserve uncontrolled mode when open is absent.
        open: undefined,
    },
)

const api = useCollapsible({
    // The mode is fixed at setup, so the value is never undefined while controlled.
    open: props.open === undefined ? undefined : toRef(() => props.open as boolean),
    defaultOpen: props.defaultOpen,
    disabled: toRef(props, 'disabled'),
    onOpenChange: props.onOpenChange,
})

const { state, actions, bindings } = api

provideCollapsibleContext(api)

defineExpose({ state, actions, bindings })
</script>

<template>
    <div v-bind="$attrs">
        <slot :state="state" :actions="actions" :bindings="bindings" />
    </div>
</template>
