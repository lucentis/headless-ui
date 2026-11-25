<script setup lang="ts">
import { toRef } from 'vue'
import { useButton } from '@lucentis/headless-ui-core'

defineOptions({
    inheritAttrs: false,
})

type ButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
    defineProps<{
        disabled?: boolean
        type?: ButtonType
    }>(),
    {
        disabled: false,
        type: 'button',
    },
)

const { bindings } = useButton({
    disabled: toRef(props, 'disabled'),
})
</script>

<template>
    <button
        v-bind="{
            ...bindings.root,
            ...$attrs,
        }"
        :type="type"
    >
        <slot />
    </button>
</template>
