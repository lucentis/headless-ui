import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { isClient } from './isClient'

export interface UseEscapeOptions {
    active: Ref<boolean>
    onEscape: () => void
}

export function useEscape(options: UseEscapeOptions): void {
    const { active, onEscape } = options

    function onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.stopPropagation()
            onEscape()
        }
    }

    watch(active, (isActive) => {
        if (!isClient) return
        if (isActive) document.addEventListener('keydown', onKeydown)
        else document.removeEventListener('keydown', onKeydown)
    }, { immediate: true })

    onUnmounted(() => { if (isClient) document.removeEventListener('keydown', onKeydown) })
}