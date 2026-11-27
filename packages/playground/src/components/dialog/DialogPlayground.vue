<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogTrigger, DialogOverlay, DialogContent } from '@lucentis/headless-ui'

const controlledOpen = ref(false)

function handleControlledOpenChange(value: boolean) {
    controlledOpen.value = value
    console.log('Controlled dialog:', value)
}

function handlePreventTrigger(event: MouseEvent) {
    console.log('Trigger clicked: opening prevented')
    event.preventDefault()
}

function handleTriggerClick() {
    console.log('User click handler executed')
}
</script>

<template>
    <main class="playground">
        <h1>Dialog playground</h1>

        <!-- Uncontrolled -->
        <section>
            <h2>Uncontrolled dialog</h2>

            <Dialog v-slot="{ state, actions, bindings }">
                <DialogTrigger>Open dialog</DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content">
                        <h2 v-bind="bindings.title">Uncontrolled dialog</h2>
                        <p v-bind="bindings.description">This dialog manages its own open state.</p>

                        <p>Current state: {{ state.isOpen ? 'Open' : 'Closed' }}</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
        </section>

        <!-- Default open -->
        <section>
            <h2>Default open</h2>

            <Dialog :default-open="true" v-slot="{ state, actions, bindings }">
                <DialogTrigger>Trigger (initially open)</DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content">
                        <h2 v-bind="bindings.title">Initially open</h2>
                        <p v-bind="bindings.description">This dialog starts open because defaultOpen is true.</p>

                        <p>Open: {{ state.isOpen }}</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
        </section>

        <!-- Controlled -->
        <section>
            <h2>Controlled dialog</h2>

            <div class="controls">
                <button type="button" @click="controlledOpen = true">Open from parent</button>

                <button type="button" @click="controlledOpen = false">Close from parent</button>
            </div>

            <Dialog
                :open="controlledOpen"
                :on-open-change="handleControlledOpenChange"
                v-slot="{ state, actions, bindings }"
            >
                <DialogTrigger>Open with trigger</DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content">
                        <h2 v-bind="bindings.title">Controlled dialog</h2>
                        <p v-bind="bindings.description">The parent owns the open state.</p>

                        <p>Open: {{ state.isOpen }}</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>

            <p>Parent state: {{ controlledOpen }}</p>
        </section>

        <!-- Non-modal -->
        <section>
            <h2>Non-modal dialog</h2>

            <Dialog :modal="false" v-slot="{ actions, bindings }">
                <DialogTrigger>Open non-modal dialog</DialogTrigger>

                <Teleport to="body">
                    <DialogContent class="dialog-content non-modal">
                        <h2 v-bind="bindings.title">Non-modal dialog</h2>
                        <p v-bind="bindings.description">This dialog does not trap focus or lock page scrolling.</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
        </section>

        <!-- Without description -->
        <section>
            <h2>Without accessible description</h2>

            <Dialog v-slot="{ actions, bindings }">
                <DialogTrigger>Open without description</DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content" :aria-describedby="undefined">
                        <h2 v-bind="bindings.title">No description</h2>

                        <p>This text is visible but is not referenced by aria-describedby.</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
        </section>

        <!-- Trigger event -->
        <section>
            <h2>Trigger click handlers</h2>

            <Dialog v-slot="{ actions, bindings }">
                <DialogTrigger @click="handlePreventTrigger"> Opening prevented </DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content">
                        <h2 v-bind="bindings.title">Prevent default</h2>
                        <p v-bind="bindings.description">
                            You should not be able to open this dialog using its trigger.
                        </p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>

            <Dialog v-slot="{ actions, bindings }">
                <DialogTrigger @click="handleTriggerClick"> Normal click handler </DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content">
                        <h2 v-bind="bindings.title">Normal click</h2>
                        <p v-bind="bindings.description">The user handler runs before the dialog opens.</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
        </section>

        <!-- Custom attributes -->
        <section>
            <h2>Custom attributes</h2>

            <Dialog v-slot="{ actions, bindings }">
                <DialogTrigger
                    class="custom-trigger"
                    aria-label="Open the customized dialog"
                    data-testid="custom-dialog-trigger"
                >
                    Custom trigger
                </DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay custom-overlay" data-testid="custom-dialog-overlay" />

                    <DialogContent class="dialog-content custom-content" data-testid="custom-dialog-content">
                        <h2 v-bind="bindings.title">Custom attributes</h2>
                        <p v-bind="bindings.description">The components accept custom classes and attributes.</p>

                        <button type="button" @click="actions.close">Close dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
        </section>

        <!-- Nested dialogs -->
        <section>
            <h2>Nested dialogs</h2>

            <Dialog v-slot="{ actions, bindings }">
                <DialogTrigger>Open parent dialog</DialogTrigger>

                <Teleport to="body">
                    <DialogOverlay class="dialog-overlay" />

                    <DialogContent class="dialog-content">
                        <h2 v-bind="bindings.title">Parent dialog</h2>
                        <p v-bind="bindings.description">This dialog can open another dialog.</p>

                        <Dialog v-slot="{ actions: childActions, bindings: childBindings }">
                            <DialogTrigger>Open nested dialog</DialogTrigger>

                            <Teleport to="body">
                                <DialogOverlay class="dialog-overlay nested-overlay" />

                                <DialogContent class="dialog-content nested-content">
                                    <h2 v-bind="childBindings.title">Nested dialog</h2>
                                    <p v-bind="childBindings.description">
                                        This is a second dialog rendered through its own Teleport.
                                    </p>

                                    <button type="button" @click="childActions.close">Close nested dialog</button>
                                </DialogContent>
                            </Teleport>
                        </Dialog>

                        <button type="button" @click="actions.close">Close parent dialog</button>
                    </DialogContent>
                </Teleport>
            </Dialog>
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
    align-items: flex-start;
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

.dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgb(0 0 0 / 50%);
}

.dialog-content {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 101;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: min(420px, calc(100vw - 32px));
    padding: 24px;
    transform: translate(-50%, -50%);
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    color: #222;
    box-shadow: 0 12px 40px rgb(0 0 0 / 20%);
}

.dialog-content h2 {
    margin: 0;
    font-size: 20px;
}

.dialog-content p {
    margin: 0;
}

.non-modal {
    left: auto;
    right: 24px;
    transform: translateY(-50%);
}

.custom-overlay {
    background: rgb(30 60 120 / 50%);
}

.custom-content {
    border: 2px solid #6478c8;
}

.nested-overlay {
    z-index: 110;
}

.nested-content {
    z-index: 111;
}

.custom-trigger {
    font-weight: bold;
}
</style>
