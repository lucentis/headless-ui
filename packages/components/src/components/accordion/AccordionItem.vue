<script setup lang="ts">
import { toRef } from 'vue'
import { provideAccordionItemContext, useAccordionItem } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps<{
    value: string
    disabled?: boolean
}>()

const api = useAccordionItem({
    value: props.value,
    disabled: toRef(props, 'disabled'),
})

const { state, actions, bindings } = api

provideAccordionItemContext(api)

defineExpose({ state, actions, bindings })
</script>

<template>
    <div v-bind="$attrs">
        <slot :state="state" :actions="actions" :bindings="bindings" />
    </div>
</template>
