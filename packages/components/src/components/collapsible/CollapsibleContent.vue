<script setup lang="ts">
import { mergeProps } from 'vue'
import { useCollapsibleContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const { state, bindings } = useCollapsibleContext()
</script>

<template>
    <div v-if="state.isPresent" v-bind="mergeProps(bindings.content, $attrs)">
        <slot />
    </div>
</template>
