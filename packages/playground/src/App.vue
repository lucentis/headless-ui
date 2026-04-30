<script setup lang="ts">
import { useButton } from '@lucentis/headless-ui-core'
import { ref } from 'vue';

const isLoading = ref(true)
const { bindings } = useButton({ disabled: isLoading })

console.log(bindings);

</script>

<template>
  <button v-bind="bindings.button">Submit</button>
</template>
