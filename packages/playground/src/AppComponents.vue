<script setup lang="ts">
import { ref } from 'vue'
import ButtonPlayground from './components/button/ButtonPlayground.vue'

const activeComponent = ref('button')
</script>

<template>
    <h1>Components Playground</h1>
    <div class="components-playground">
        <aside>
            <nav>
                <button type="button" @click="activeComponent = 'button'">Button</button>
            </nav>
        </aside>

        <main>
            <ButtonPlayground v-if="activeComponent === 'button'" />
        </main>
    </div>
</template>

<style>
.components-playground {
    display: flex;
}
</style>
