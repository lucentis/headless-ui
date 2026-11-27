<script setup lang="ts">
import { toRef } from 'vue'
import { provideDialogContext, useDialog } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = withDefaults(
    defineProps<{
        open?: boolean
        defaultOpen?: boolean
        modal?: boolean
        onOpenChange?: (value: boolean) => void
    }>(),
    {
        open: undefined,
        modal: undefined,
    },
)

const api = useDialog({
    open: props.open === undefined ? undefined : toRef(() => props.open as boolean),
    defaultOpen: props.defaultOpen,
    modal: toRef(() => props.modal as boolean),
    onOpenChange: props.onOpenChange,
})

const { state, actions, bindings, contentRef } = api

provideDialogContext(api)

defineExpose({ state, actions, bindings, contentRef })
</script>

<template>
    <div v-bind="$attrs">
        <slot :state="state" :actions="actions" :bindings="bindings" />
    </div>
</template>
