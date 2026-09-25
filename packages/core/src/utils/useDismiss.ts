import { computed, toValue } from 'vue'
import type { MaybeRef, Ref } from 'vue'
import { useEscape } from './useEscape'
import { useOutsideClick } from './useOutsideClick'

export interface UseDismissOptions {
    active: MaybeRef<boolean>
    targets: Ref<HTMLElement | null>[]
    onDismiss: () => void
    escape?: MaybeRef<boolean>
    outsideClick?: MaybeRef<boolean>
}

export function useDismiss(options: UseDismissOptions): void {
    const escapeActive = computed(() =>
        toValue(options.active) && toValue(options.escape ?? true)
    )

    const outsideClickActive = computed(() =>
        toValue(options.active) && toValue(options.outsideClick ?? true)
    )

    useEscape({
        active: escapeActive,
        onEscape: options.onDismiss,
    })

    useOutsideClick({
        active: outsideClickActive,
        targets: options.targets,
        onOutsideClick: options.onDismiss,
    })
}