<script setup lang="ts">
import { useButton, useAlert } from '@lucentis/headless-ui-core'
import { ref } from 'vue';

const isLoading = ref(false)
const { bindings } = useButton({ disabled: isLoading })

const alert = useAlert()

console.log(bindings);

</script>

<template>
  <button v-bind="bindings.button" @click="console.log('clicked')">Submit</button>

  <div class="" v-bind="alert.bindings.root">
    <p>alert</p>

    <button @click="alert.actions.close">Close</button>
  </div>
</template>
