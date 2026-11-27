import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { isClient } from './isClient'
import type { Layer } from './useLayer'

export interface UseOutsideClickOptions {
    targets: Ref<HTMLElement | null>[]
    active: Ref<boolean>
    onOutsideClick: () => void
    layer?: Layer
}

export function useOutsideClick(options: UseOutsideClickOptions): void {
    const { targets, active, onOutsideClick, layer } = options

    function onClick(event: MouseEvent): void {
        const target = event.target as Node
        const isInside = targets.some((ref) => ref.value?.contains(target))

        if (isInside) return
        if (layer && !layer.acceptsOutsideClick(target)) return

        onOutsideClick()
    }

    watch(
        active,
        (isActive) => {
            if (!isClient) return
            if (isActive) document.addEventListener('mousedown', onClick)
            else document.removeEventListener('mousedown', onClick)
        },
        { immediate: true },
    )

    onUnmounted(() => {
        if (isClient) document.removeEventListener('mousedown', onClick)
    })
}
