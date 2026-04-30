<script setup lang="ts">
import { useButton } from '@lucentis/headless-ui-core'
import { ref } from 'vue';

const isLoading = ref(true)
const { props } = useButton({ disabled: isLoading })

console.log(props);

</script>

<template>
  <button v-bind="props.button">Submit</button>
</template>
