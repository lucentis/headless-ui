<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue'
import { useCollapsibleContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

type ClickHandler = (event: MouseEvent) => void

const props = defineProps<{
    onClick?: ClickHandler | ClickHandler[]
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
