<script setup lang="ts">
import { toRef } from 'vue'
import { useSeparator } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = withDefaults(
    defineProps<{
        orientation?: 'horizontal' | 'vertical'
        decorative?: boolean
    }>(),
    {
        orientation: 'horizontal',
        decorative: false,
    },
)

const { bindings } = useSeparator({
    orientation: toRef(props, 'orientation'),
    decorative: toRef(props, 'decorative'),
})
</script>

<template>
    <div
        v-bind="{
            ...bindings.root,
            ...$attrs,
        }"
    />
</template>
