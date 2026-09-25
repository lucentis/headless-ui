import { computed, ref, toValue, watch, reactive } from 'vue'
import { useOpenState } from '../../utils/useOpenState'
import { useScrollLock } from '../../utils/useScrollLock'
import { useFocusTrap } from '../../utils/useFocusTrap'
import { useEscape } from '../../utils/useEscape'
import { useId } from '../../utils/useId'
import { useConfig } from '../../config'
import type { UseDialogProps, DialogApi, DialogState, DialogActions, DialogBindings } from './types'

export function useDialog(props: UseDialogProps = {}): DialogApi {
    const config = useConfig()

    const { isOpen, isPresent, open, close } = useOpenState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
        animationDuration: config.animationDuration
    })

    const isModal = computed(() => toValue(props.modal) ?? true)

    const titleId = useId('dialog-title')
    const descriptionId = useId('dialog-description')
    const contentRef = ref<HTMLElement | null>(null)

    const { lock, unlock } = useScrollLock()
    
    watch(
        () => isOpen.value && isModal.value && config.scrollLock !== 'none',
        (shouldLock) => shouldLock ? lock() : unlock(),
        { immediate: true }
    )

    useFocusTrap({
        container: contentRef,
        active: computed(() => isOpen.value && isModal.value),
    })

    useEscape({
        active: isOpen,
        onEscape: () => {
            if (config.closeOnEscape) actions.close()
        },
    })

    const state = reactive<DialogState>({
        get isOpen() { return isOpen.value },
        get isPresent() { return isPresent.value },
        get isModal() { return isModal.value },
        get titleId() { return titleId },
        get descriptionId() { return descriptionId },
    })

    const actions: DialogActions = { open, close }

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
    }))

    const bindings: DialogBindings = {
        get overlay() { return overlayBindings.value },
        get content() { return contentBindings.value },
        get title() { return { id: titleId } },
        get description() { return { id: descriptionId } },
    }

    return { state, actions, bindings, contentRef }
}