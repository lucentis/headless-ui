<script setup lang="ts">
import { mergeProps } from 'vue'
import { useCollapsibleTrigger } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const { bindings } = useCollapsibleTrigger()
</script>

<template>
    <button v-bind="mergeProps(bindings.root, $attrs)" type="button">
        <slot />
    </button>
</template>
