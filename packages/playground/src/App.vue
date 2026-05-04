<script setup lang="ts">
import { useButton, useAlert, useCollapsible, useAccordion, useAccordionItem, useTabs, useTabsTrigger, useTabsPanel } from '@lucentis/headless-ui-core'
import { ref } from 'vue';

const isLoading = ref(false)
const { bindings } = useButton({ disabled: isLoading })

const alert = useAlert()
const collapsible = useCollapsible({ defaultOpen: false })

const accordion = useAccordion({ type: 'multiple' })
const item1 = useAccordionItem({ value: 'item-1' }, accordion)
const item2 = useAccordionItem({ value: 'item-2' }, accordion)
const item3 = useAccordionItem({ value: 'item-3' }, accordion)

const tabs = useTabs({ defaultValue: 'tab-1' })
const trigger1 = useTabsTrigger({ value: 'tab-1' }, tabs)
const trigger2 = useTabsTrigger({ value: 'tab-2' }, tabs)
const trigger3 = useTabsTrigger({ value: 'tab-3' }, tabs)
const panel1 = useTabsPanel({ value: 'tab-1' }, tabs)
const panel2 = useTabsPanel({ value: 'tab-2' }, tabs)
const panel3 = useTabsPanel({ value: 'tab-3' }, tabs)


</script>

<template>
    <button v-bind="bindings.button" @click="console.log('clicked')">Submit</button>

    <!-- alert -->
    <div class="" v-bind="alert.bindings.root">
        <p>alert</p>

        <button @click="alert.actions.close">Close</button>
    </div>

    <!-- collapsible -->
    <div>
        <button v-bind="collapsible.bindings.trigger">
        {{ collapsible.state.isOpen ? 'Close' : 'Open' }} section
        </button>

        <div v-if="collapsible.state.isPresent" v-bind="collapsible.bindings.content">
        <p>This is the collapsible content.</p>
        </div>
    </div>

    <!-- accordion -->
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

    <!-- tabs -->
    <div>
        <div role="tablist" :aria-orientation="tabs.state.orientation">
            <button v-bind="trigger1.bindings.trigger">Tab 1</button>
            <button v-bind="trigger2.bindings.trigger">Tab 2</button>
            <button v-bind="trigger3.bindings.trigger">Tab 3</button>
        </div>

        <div v-if="panel1.state.isSelected" v-bind="panel1.bindings.panel">
            Content 1
        </div>
        
        <div v-if="panel2.state.isSelected" v-bind="panel2.bindings.panel">
            Content 2
        </div>

        <div v-if="panel3.state.isSelected" v-bind="panel3.bindings.panel">
            Content 3
        </div>
    </div>
</template>