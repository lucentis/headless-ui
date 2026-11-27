<script setup lang="ts">
import { mergeProps } from 'vue'
import { useDialogContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const { state, bindings } = useDialogContext()
</script>

<template>
    <div v-if="state.isPresent" v-bind="mergeProps(bindings.overlay, $attrs)">
        <slot />
    </div>
</template>
