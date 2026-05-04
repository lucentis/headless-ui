<script setup lang="ts">
import { useButton, useAlert, useCollapsible, useAccordion, useAccordionItem } from '@lucentis/headless-ui-core'
import { ref } from 'vue';

const isLoading = ref(false)
const { bindings } = useButton({ disabled: isLoading })

const alert = useAlert()

console.log(bindings);


const collapsible = useCollapsible({ defaultOpen: false })

const accordion = useAccordion({ type: 'multiple' })

const item1 = useAccordionItem({ value: 'item-1' }, accordion)
const item2 = useAccordionItem({ value: 'item-2' }, accordion)
const item3 = useAccordionItem({ value: 'item-3' }, accordion)
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


  <div>
    <div>
      <h3>
        <button v-bind="item1.bindings.trigger">Item 1</button>
      </h3>
      <div v-if="item1.state.isExpanded" v-bind="item1.bindings.content">
        <p>Content for item 1</p>
      </div>
    </div>

    <div>
      <h3>
        <button v-bind="item2.bindings.trigger">Item 2</button>
      </h3>
      <div v-if="item2.state.isExpanded" v-bind="item2.bindings.content">
        <p>Content for item 2</p>
      </div>
    </div>

    <div>
      <h3>
        <button v-bind="item3.bindings.trigger">Item 3</button>
      </h3>
      <div v-if="item3.state.isExpanded" v-bind="item3.bindings.content">
        <p>Content for item 3</p>
      </div>
    </div>
  </div>
</template>
