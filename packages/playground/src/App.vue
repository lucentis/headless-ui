<script setup lang="ts">
import { useButton, useAlert } from '@lucentis/headless-ui-core'
import { ref } from 'vue';

const isLoading = ref(false)
const { bindings } = useButton({ disabled: isLoading })

const alert = useAlert()

console.log(bindings);


import { useCollapsible } from '@lucentis/headless-ui-core'

const collapsible = useCollapsible({ defaultOpen: false })
</script>

<template>
  <button v-bind="bindings.button" @click="console.log('clicked')">Submit</button>

  <div class="" v-bind="alert.bindings.root">
    <p>alert</p>

    <button @click="alert.actions.close">Close</button>
  </div>


  <div>
    <button v-bind="collapsible.bindings.trigger">
      {{ collapsible.state.isOpen ? 'Close' : 'Open' }} section
    </button>

    <div v-if="collapsible.state.isPresent" v-bind="collapsible.bindings.content">
      <p>This is the collapsible content.</p>
    </div>
  </div>
</template>
