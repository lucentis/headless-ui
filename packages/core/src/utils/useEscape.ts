import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

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
        if (isActive) document.addEventListener('keydown', onKeydown)
        else document.removeEventListener('keydown', onKeydown)
    }, { immediate: true })

    onUnmounted(() => document.removeEventListener('keydown', onKeydown))
}