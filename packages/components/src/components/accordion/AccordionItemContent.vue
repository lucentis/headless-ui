<script setup lang="ts">
import { mergeProps } from 'vue'
import { useAccordionItemContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const { state, bindings } = useAccordionItemContext()
</script>

<template>
    <div v-show="state.isExpanded" v-bind="mergeProps(bindings.content, $attrs)">
        <slot />
    </div>
</template>
