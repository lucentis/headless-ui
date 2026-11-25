<script setup lang="ts">
import { ref } from 'vue'
import { Alert } from '@lucentis/headless-ui'

const isOpen = ref(true)

function handleOpenChange(value: boolean) {
    isOpen.value = value
}
</script>

<template>
    <main>
        <h1>Alert playground</h1>

        <section>
            <h2>Status</h2>

            <Alert> This is a status message. </Alert>
        </section>

        <section>
            <h2>Alert</h2>

            <Alert role="alert"> This is an alert message. </Alert>
        </section>

        <section>
            <h2>Controlled state</h2>

            <button type="button" @click="isOpen = true">Reopen alert</button>

            <Alert :open="isOpen" :on-open-change="handleOpenChange" class="custom-alert">
                <span>Controlled alert message.</span>
                <button type="button" @click="isOpen = false">Close</button>
            </Alert>

            <p>Open: {{ isOpen }}</p>
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

.custom-alert {
    padding: 12px;
    border: 1px solid #888;
}
</style>
