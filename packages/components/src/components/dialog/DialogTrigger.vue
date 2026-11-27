<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue'
import { useDialogContext } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

type ClickHandler = (event: MouseEvent) => void

const props = defineProps<{
    onClick?: ClickHandler | ClickHandler[]
}>()

const attrs = useAttrs()
const { state, actions, bindings } = useDialogContext()

const triggerBindings = computed(() => ({
    type: 'button' as const,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': state.isOpen,
    'aria-controls': bindings.content.id,
    onClick: (event: MouseEvent) => {
        for (const handler of [props.onClick].flat()) {
            handler?.(event)
        }

        if (!event.defaultPrevented) {
            actions.open()
        }
    },
}))
</script>

<template>
    <button v-bind="mergeProps(triggerBindings, attrs)">
        <slot />
    </button>
</template>
