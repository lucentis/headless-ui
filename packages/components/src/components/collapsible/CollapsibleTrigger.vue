<script setup lang="ts">
import { mergeProps, useAttrs } from 'vue'
import { useCollapsibleTrigger } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

const attrs = useAttrs()

// The consumer handler goes through the composable so that preventDefault can cancel the toggle.
// It is read at call time, and is an array when several listeners are bound.
const { bindings } = useCollapsibleTrigger({
    onClick: (event) => {
        for (const handler of [attrs.onClick].flat()) {
            if (typeof handler === 'function') handler(event)
        }
    },
})

function attrsWithoutClick() {
    const rest = { ...attrs }
    delete rest.onClick
    return rest
}
</script>

<template>
    <button v-bind="mergeProps(bindings.root, attrsWithoutClick())" type="button">
        <slot />
    </button>
</template>
