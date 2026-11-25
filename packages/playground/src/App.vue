<script setup lang="ts">
import { ref } from 'vue'
import AppCore from './AppCore.vue'
import AppComponents from './AppComponents.vue'

type Tab = 'core' | 'components'

const activeTab = ref<Tab>('core')
</script>

<template>
    <div class="app">
        <nav class="tabs">
            <button type="button" :class="{ active: activeTab === 'core' }" @click="activeTab = 'core'">Core</button>

            <button type="button" :class="{ active: activeTab === 'components' }" @click="activeTab = 'components'">
                Components
            </button>
        </nav>

        <main class="content">
            <AppCore v-if="activeTab === 'core'" />
            <AppComponents v-else />
        </main>
    </div>
</template>
