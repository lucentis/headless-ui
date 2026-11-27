import { computed, onUnmounted, shallowRef, toValue, watch } from 'vue'
import type { MaybeRef, Ref } from 'vue'

export interface UseLayerOptions {
    /** The layer is on the stack while this is true. */
    active: MaybeRef<boolean>
    /** Elements that belong to the layer, typically the trigger and the content. */
    targets?: Ref<HTMLElement | null>[]
    /** A modal layer blocks the outside click of every layer below it. Defaults to false. */
    modal?: MaybeRef<boolean>
}

export interface Layer {
    /** True when this layer is the topmost active layer. */
    isTopLayer: Readonly<Ref<boolean>>
    /** Whether an outside click is allowed for this layer. */
    acceptsOutsideClick: (target: Node) => boolean
}

interface LayerEntry {
    targets: Ref<HTMLElement | null>[]
    isModal: () => boolean
}

// Shared by every layer instance, in opening order.
const layerStack = shallowRef<LayerEntry[]>([])

export function useLayer(options: UseLayerOptions): Layer {
    const entry: LayerEntry = {
        targets: options.targets ?? [],
        isModal: () => toValue(options.modal) ?? false,
    }

    function add(): void {
        layerStack.value = [...layerStack.value.filter((layer) => layer !== entry), entry]
    }

    function remove(): void {
        layerStack.value = layerStack.value.filter((layer) => layer !== entry)
    }

    function getLayersAbove(): LayerEntry[] {
        const index = layerStack.value.indexOf(entry)

        return index === -1 ? [] : layerStack.value.slice(index + 1)
    }

    const isTopLayer = computed(() => {
        return layerStack.value.at(-1) === entry
    })

    if (typeof document !== 'undefined') {
        watch(
            () => toValue(options.active),
            (isActive) => {
                if (isActive) add()
                else remove()
            },
            { immediate: true, flush: 'sync' },
        )

        onUnmounted(remove)
    }

    return {
        isTopLayer,

        acceptsOutsideClick(target) {
            const above = getLayersAbove()

            if (above.some((layer) => layer.isModal())) {
                return false
            }

            return !above.some((layer) => layer.targets.some((ref) => ref.value?.contains(target)))
        },
    }
}
