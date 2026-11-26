<script setup lang="ts">
import { ref } from 'vue'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@lucentis/headless-ui'

const controlledOpen = ref(false)

function handleUncontrolledOpenChange(value: boolean) {
    console.log('Uncontrolled open change:', value)
}

function handleTriggerClick(event: MouseEvent) {
    console.log('Trigger clicked:', event)
    event.preventDefault()
}
</script>

<template>
    <main>
        <h1>Collapsible playground</h1>

        <section>
            <h2>Controlled state</h2>

            <button type="button" @click="controlledOpen = true">Open from parent</button>

            <button type="button" @click="controlledOpen = false">Close from parent</button>

            <Collapsible :open="controlledOpen" :on-open-change="(value) => (controlledOpen = value)">
                <CollapsibleTrigger> Toggle controlled content </CollapsibleTrigger>

                <CollapsibleContent>
                    <p>This content is controlled by the parent.</p>
                </CollapsibleContent>
            </Collapsible>

            <p>Open: {{ controlledOpen }}</p>
        </section>

        <section>
            <h2>Uncontrolled state</h2>

            <Collapsible :default-open="true" :on-open-change="handleUncontrolledOpenChange" v-slot="{ state }">
                <CollapsibleTrigger> Toggle uncontrolled content </CollapsibleTrigger>

                <CollapsibleContent>
                    <p>This content is managed internally.</p>
                </CollapsibleContent>

                <p>Open: {{ state.isOpen }}</p>
            </Collapsible>
        </section>

        <section>
            <h2>User click handler</h2>

            <Collapsible>
                <CollapsibleTrigger @click="handleTriggerClick"> Click me </CollapsibleTrigger>

                <CollapsibleContent>
                    <p>The internal toggle still works.</p>
                </CollapsibleContent>
            </Collapsible>
        </section>
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
}

section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

h1 {
    font-size: 24px;
}

h2 {
    font-size: 16px;
}
</style>
