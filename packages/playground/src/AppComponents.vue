<script setup lang="ts">
import { ref } from 'vue'
import ButtonPlayground from './components/button/ButtonPlayground.vue'
import SeparatorPlayground from './components/separator/SeparatorPlayground.vue'

const activeComponent = ref('button')
</script>

<template>
    <h1>Components Playground</h1>

    <div class="components-playground">
        <aside>
            <nav>
                <button type="button" @click="activeComponent = 'button'">Button</button>
                <button type="button" @click="activeComponent = 'separator'">Separator</button>
            </nav>
        </aside>

        <main>
            <ButtonPlayground v-if="activeComponent === 'button'" />
            <SeparatorPlayground v-else-if="activeComponent === 'separator'" />
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
