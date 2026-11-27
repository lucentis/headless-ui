import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { isClient } from './isClient'
import type { Layer } from './useLayer'

export interface UseEscapeOptions {
    active: Ref<boolean>
    onEscape: () => void
    layer?: Layer
}

export function useEscape(options: UseEscapeOptions): void {
    const { active, onEscape, layer } = options

    function onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            if (layer && !layer.isTopLayer.value) return

            event.stopPropagation()
            onEscape()
        }
    }

    watch(
        active,
        (isActive) => {
            if (!isClient) return
            if (isActive) document.addEventListener('keydown', onKeydown)
            else document.removeEventListener('keydown', onKeydown)
        },
        { immediate: true },
    )

    onUnmounted(() => {
        if (isClient) document.removeEventListener('keydown', onKeydown)
    })
}
