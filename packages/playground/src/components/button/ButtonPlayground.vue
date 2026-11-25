<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@lucentis/headless-ui'

const disabled = ref(false)
const clickCount = ref(0)

function handleClick() {
    clickCount.value++
}
</script>

<template>
    <main class="playground">
        <h1>Button playground</h1>

        <section>
            <h2>Default</h2>
            <Button @click="handleClick"> Default button </Button>
        </section>

        <section>
            <h2>Types</h2>

            <Button type="button">Button</Button>
            <Button type="submit">Submit</Button>
            <Button type="reset">Reset</Button>
        </section>

        <section>
            <h2>Attributes</h2>

            <Button
                id="custom-button"
                class="custom-button"
                aria-label="Custom button"
                data-testid="custom-button"
                @click="handleClick"
            >
                Custom button
            </Button>
        </section>

        <section>
            <h2>Disabled</h2>

            <Button disabled> Disabled button </Button>

            <Button :disabled="disabled" @click="handleClick"> Reactive disabled button </Button>

            <button @click="disabled = !disabled">Toggle disabled ({{ disabled ? 'ON' : 'OFF' }})</button>
        </section>

        <section>
            <h2>ARIA override</h2>

            <Button disabled aria-disabled="false" data-disabled="custom"> Custom ARIA attributes </Button>
        </section>

        <section>
            <h2>Events</h2>

            <p>Click count: {{ clickCount }}</p>

            <Button @click="handleClick"> Increment </Button>
        </section>
    </main>
</template>

<style scoped>
.playground {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
}

section {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

h1 {
    font-size: 24px;
}

h2 {
    width: 100%;
    font-size: 16px;
}

.custom-button {
    padding: 8px 16px;
    border: 1px solid #888;
    border-radius: 6px;
}
</style>
