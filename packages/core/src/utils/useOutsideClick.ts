import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface UseOutsideClickOptions {
    targets: Ref<HTMLElement | null>[]
    active: Ref<boolean>
    onOutsideClick: () => void
}

export function useOutsideClick(options: UseOutsideClickOptions): void {
    const { targets, active, onOutsideClick } = options

    function onClick(event: MouseEvent): void {
        const target = event.target as Node
        const isInside = targets.some(ref => ref.value?.contains(target))
        if (!isInside) onOutsideClick()
    }

    watch(active, (isActive) => {
        if (isActive) document.addEventListener('mousedown', onClick)
        else document.removeEventListener('mousedown', onClick)
    }, { immediate: true })

    onUnmounted(() => document.removeEventListener('mousedown', onClick))
}