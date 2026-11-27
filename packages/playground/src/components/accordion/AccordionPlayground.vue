<script setup lang="ts">
import { ref } from 'vue'
import { Accordion, AccordionItem, AccordionItemTrigger, AccordionItemContent } from '@lucentis/headless-ui'

const controlledSingle = ref('item-2')
const controlledMultiple = ref(['item-1', 'item-3'])

function handleSingleChange(value: string | string[]) {
    console.log('Controlled single:', value)
    controlledSingle.value = value as string
}

function handleMultipleChange(value: string | string[]) {
    console.log('Controlled multiple:', value)
    controlledMultiple.value = value as string[]
}
</script>

<template>
    <main class="playground">
        <h1>Accordion playground</h1>

        <!-- Single uncontrolled -->
        <section>
            <h2>Single — uncontrolled</h2>

            <Accordion type="single" default-value="item-1">
                <AccordionItem value="item-1">
                    <AccordionItemTrigger>First item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>First item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionItemTrigger>Second item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Second item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionItemTrigger>Third item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Third item content.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>
        </section>

        <!-- Multiple uncontrolled -->
        <section>
            <h2>Multiple — uncontrolled</h2>

            <Accordion type="multiple" :default-value="['item-1', 'item-3']">
                <AccordionItem value="item-1">
                    <AccordionItemTrigger>First item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>First item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionItemTrigger>Second item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Second item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionItemTrigger>Third item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Third item content.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>
        </section>

        <!-- Single controlled -->
        <section>
            <h2>Single — controlled</h2>

            <div class="controls">
                <button type="button" @click="controlledSingle = 'item-1'">Open first</button>

                <button type="button" @click="controlledSingle = 'item-2'">Open second</button>

                <button type="button" @click="controlledSingle = ''">Close all</button>
            </div>

            <Accordion type="single" :value="controlledSingle" :on-value-change="handleSingleChange">
                <AccordionItem value="item-1">
                    <AccordionItemTrigger
                        @click="
                            (e: MouseEvent) => {
                                e.preventDefault()
                                console.log('prevent default')
                            }
                        "
                        >First item</AccordionItemTrigger
                    >
                    <AccordionItemContent>
                        <p>First item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionItemTrigger>Second item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Second item content.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>

            <p>Current value: {{ controlledSingle || '(empty)' }}</p>
        </section>

        <!-- Multiple controlled -->
        <section>
            <h2>Multiple — controlled</h2>

            <div class="controls">
                <button type="button" @click="controlledMultiple = ['item-1', 'item-2', 'item-3']">Open all</button>

                <button type="button" @click="controlledMultiple = []">Close all</button>
            </div>

            <Accordion type="multiple" :value="controlledMultiple" :on-value-change="handleMultipleChange">
                <AccordionItem value="item-1">
                    <AccordionItemTrigger>First item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>First item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionItemTrigger>Second item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Second item content.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionItemTrigger>Third item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>Third item content.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>

            <p>Current value: {{ controlledMultiple }}</p>
        </section>

        <!-- Disabled accordion -->
        <section>
            <h2>Disabled accordion</h2>

            <Accordion type="single" default-value="item-1" disabled>
                <AccordionItem value="item-1">
                    <AccordionItemTrigger>First item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>This item cannot be toggled.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionItemTrigger>Second item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>This item cannot be toggled either.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>
        </section>

        <!-- Disabled item -->
        <section>
            <h2>Disabled item</h2>

            <Accordion type="multiple">
                <AccordionItem value="item-1">
                    <AccordionItemTrigger>Enabled item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>This item can be toggled.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-2" disabled>
                    <AccordionItemTrigger>Disabled item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>This item cannot be toggled.</p>
                    </AccordionItemContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionItemTrigger>Another enabled item</AccordionItemTrigger>
                    <AccordionItemContent>
                        <p>This item can also be toggled.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>
        </section>

        <!-- Custom attributes -->
        <section>
            <h2>Custom attributes</h2>

            <Accordion type="single" class="custom-accordion">
                <AccordionItem value="item-1" class="custom-item">
                    <AccordionItemTrigger
                        class="custom-trigger"
                        aria-label="Toggle custom content"
                        data-testid="custom-trigger"
                    >
                        Custom trigger
                    </AccordionItemTrigger>

                    <AccordionItemContent class="custom-content">
                        <p>Custom content with additional attributes.</p>
                    </AccordionItemContent>
                </AccordionItem>
            </Accordion>
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
    flex-direction: column;
    gap: 12px;
}

h1 {
    font-size: 24px;
}

h2 {
    font-size: 16px;
}

.controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.custom-item {
    border: 1px solid #888;
    border-radius: 6px;
}

.custom-trigger {
    padding: 12px;
}

.custom-content {
    padding: 12px;
}
</style>
