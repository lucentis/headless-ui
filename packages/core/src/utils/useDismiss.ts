import { computed, toValue } from 'vue'
import type { MaybeRef, Ref } from 'vue'
import { useEscape } from './useEscape'
import { useOutsideClick } from './useOutsideClick'
import { useLayer } from './useLayer'

export interface UseDismissOptions {
    active: MaybeRef<boolean>
    targets: Ref<HTMLElement | null>[]
    onDismiss: () => void
    modal?: MaybeRef<boolean>
    escape?: MaybeRef<boolean>
    outsideClick?: MaybeRef<boolean>
}

export function useDismiss(options: UseDismissOptions): void {
    const layer = useLayer({
        active: options.active,
        targets: options.targets,
        modal: options.modal,
    })

    const escapeActive = computed(() => toValue(options.active) && toValue(options.escape ?? true))

    const outsideClickActive = computed(() => toValue(options.active) && toValue(options.outsideClick ?? true))

    useEscape({
        active: escapeActive,
        onEscape: options.onDismiss,
        layer,
    })

    useOutsideClick({
        active: outsideClickActive,
        targets: options.targets,
        onOutsideClick: options.onDismiss,
        layer,
    })
}
