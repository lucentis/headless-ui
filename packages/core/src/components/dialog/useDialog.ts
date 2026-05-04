import { computed, ref, toValue, watch } from 'vue'
import { useId } from '../../utils/useId'
import { useScrollLock } from '../../utils/useScrollLock'
import { useFocusTrap } from '../../utils/useFocusTrap'
import { useEscape } from '../../utils/useEscape'
import { useConfig } from '../../config'
import type { UseDialogProps, DialogApi } from './types'

export function useDialog(props: UseDialogProps = {}): DialogApi {
    const config = useConfig()
    const isControlled = props.open !== undefined
    const internalOpen = ref(props.defaultOpen ?? false)

    const isOpen = computed(() => isControlled ? toValue(props.open) as boolean : internalOpen.value)
    const isModal = computed(() => toValue(props.modal) ?? true)

    const titleId = useId('dialog-title')
    const descriptionId = useId('dialog-description')

    const contentRef = ref<HTMLElement | null>(null)

    function setOpen(value: boolean): void {
        if (!isControlled) internalOpen.value = value
        props.onOpenChange?.(value)
    }

    const actions: DialogApi['actions'] = {
        open: () => setOpen(true),
        close: () => setOpen(false),
    }

    // scroll lock — only when modal and config allows it
    const { lock, unlock } = useScrollLock()
    watch(
        () => isOpen.value && isModal.value && config.scrollLock !== 'none',
        (shouldLock) => shouldLock ? lock() : unlock(),
        { immediate: true }
    )

    // focus trap — only when modal
    useFocusTrap({
        container: contentRef,
        active: computed(() => isOpen.value && isModal.value),
    })

    // escape to close — respects global config
    useEscape({
        active: isOpen,
        onEscape: () => {
            if (config.closeOnEscape) actions.close()
        },
    })

    const state: DialogApi['state'] = {
        get isOpen() { return isOpen.value },
        get isPresent() { return isOpen.value },
        get isModal() { return isModal.value },
        get titleId() { return titleId },
        get descriptionId() { return descriptionId },
    }

    const overlayBindings = computed(() => ({
        'aria-hidden': true as const,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onClick: () => {
            if (config.closeOnOutsideClick) actions.close()
        },
    }))

    const contentBindings = computed(() => ({
        role: 'dialog' as const,
        'aria-modal': isModal.value ? (true as const) : undefined,
        'aria-labelledby': titleId,
        'aria-describedby': descriptionId,
        'data-state': isOpen.value ? ('open' as const) : ('closed' as const),
        onKeydown: (event: KeyboardEvent) => {
            // prevent keydown events from bubbling outside the dialog
            event.stopPropagation()
        },
    }))

    const bindings: DialogApi['bindings'] = {
        get overlay() { return overlayBindings.value },
        get content() { return contentBindings.value },
        get title() { return { id: titleId } },
        get description() { return { id: descriptionId } },
    }

    return { state, actions, bindings, contentRef }
}