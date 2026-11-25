<script setup lang="ts">
import { ref } from 'vue'
import { Separator } from '@lucentis/headless-ui'

const orientation = ref<'horizontal' | 'vertical'>('horizontal')
const decorative = ref(false)
</script>

<template>
    <main>
        <h1>Separator playground</h1>

        <section>
            <h2>Horizontal</h2>

            <p>Content above</p>
            <Separator />
            <p>Content below</p>
        </section>

        <section>
            <h2>Vertical</h2>

            <div class="vertical-example">
                <span>First</span>
                <Separator orientation="vertical" />
                <span>Second</span>
                <Separator orientation="vertical" />
                <span>Third</span>
            </div>
        </section>

        <section>
            <h2>Reactive props</h2>

            <label>
                Orientation
                <select v-model="orientation">
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                </select>
            </label>

            <label>
                <input v-model="decorative" type="checkbox" />
                Decorative
            </label>

            <Separator :orientation="orientation" :decorative="decorative" class="custom-separator" />

            <pre>{{ { orientation, decorative } }}</pre>
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

.vertical-example {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
}

.vertical-example [data-orientation='vertical'] {
    height: 100%;
    border-left: 1px solid #888;
}

.custom-separator[data-orientation='horizontal'] {
    border-top: 1px solid #888;
}

.custom-separator[data-orientation='vertical'] {
    height: 40px;
    border-left: 1px solid #888;
}
</style>
