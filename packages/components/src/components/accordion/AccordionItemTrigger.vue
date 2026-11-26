<script setup lang="ts">
import { mergeProps } from 'vue'
import { useAccordionItemContext } from '@lucentis/headless-ui-core'
import Button from '../button/Button.vue'

defineOptions({
    inheritAttrs: false,
})

const { bindings } = useAccordionItemContext()
</script>

<template>
    <Button v-bind="mergeProps(bindings.trigger, $attrs)">
        <slot />
    </Button>
</template>
