<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue'
import { useCollapsibleContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps<{
    onClick?: (event: MouseEvent) => void | ((event: MouseEvent) => void)[]
}>()

const attrs = useAttrs()
const { bindings } = useCollapsibleContext()

const triggerBindings = computed(() => ({
    ...bindings.trigger,
    onClick: (event: MouseEvent) => {
        for (const handler of [props.onClick].flat()) {
            handler?.(event)
        }

        if (!event.defaultPrevented) {
            bindings.trigger.onClick(event)
        }
    },
}))
</script>

<template>
    <button v-bind="mergeProps(triggerBindings, attrs)" type="button">
        <slot />
    </button>
</template>
