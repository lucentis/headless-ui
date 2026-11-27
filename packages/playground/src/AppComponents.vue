<script setup lang="ts">
import { ref } from 'vue'
import ButtonPlayground from './components/button/ButtonPlayground.vue'
import SeparatorPlayground from './components/separator/SeparatorPlayground.vue'
import AlertPlayground from './components/alert/AlertPlayground.vue'
import CollapsiblePlayground from './components/collapsible/CollapsiblePlayground.vue'
import AccordionPlayground from './components/accordion/AccordionPlayground.vue'
import DialogPlayground from './components/dialog/DialogPlayground.vue'

const activeComponent = ref('button')
</script>

<template>
    <h1>Components Playground</h1>

    <div class="components-playground">
        <aside>
            <nav>
                <button type="button" @click="activeComponent = 'button'">Button</button>
                <button type="button" @click="activeComponent = 'separator'">Separator</button>
                <button type="button" @click="activeComponent = 'alert'">Alert</button>
                <button type="button" @click="activeComponent = 'collapsible'">Collapsible</button>
                <button type="button" @click="activeComponent = 'accordion'">Accordion</button>
                <button type="button" @click="activeComponent = 'dialog'">Dialog</button>
            </nav>
        </aside>

        <main>
            <ButtonPlayground v-if="activeComponent === 'button'" />
            <SeparatorPlayground v-else-if="activeComponent === 'separator'" />
            <AlertPlayground v-else-if="activeComponent === 'alert'"></AlertPlayground>
            <CollapsiblePlayground v-else-if="activeComponent === 'collapsible'" />
            <AccordionPlayground v-else-if="activeComponent === 'accordion'" />
            <DialogPlayground v-else-if="activeComponent === 'dialog'" />
        </main>
    </div>
</template>

<style>
.components-playground {
    display: flex;
}
aside nav {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
