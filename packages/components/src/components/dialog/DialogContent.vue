<script setup lang="ts">
import { mergeProps } from 'vue'
import { useDialogContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const dialog = useDialogContext()
</script>

<template>
    <div v-if="dialog.state.isPresent" ref="dialog.contentRef" v-bind="mergeProps(dialog.bindings.content, $attrs)">
        <slot />
    </div>
</template>
