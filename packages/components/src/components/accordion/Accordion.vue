<script setup lang="ts">
import { toRef } from 'vue'
import { provideAccordionContext, useAccordion } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps<{
    type?: 'single' | 'multiple'
    value?: string | string[]
    defaultValue?: string | string[]
    disabled?: boolean
    onValueChange?: (value: string | string[]) => void
}>()

const api = useAccordion({
    type: toRef(() => props.type ?? 'single'),
    value: props.value === undefined ? undefined : toRef(() => props.value as string | string[]),
    defaultValue: props.defaultValue,
    disabled: toRef(props, 'disabled'),
    onValueChange: props.onValueChange,
})

const { state, actions, bindings } = api

provideAccordionContext(api)

defineExpose({ state, actions, bindings })
</script>

<template>
    <div v-bind="$attrs">
        <slot :state="state" :actions="actions" :bindings="bindings" />
    </div>
</template>
