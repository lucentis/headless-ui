import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface UseFocusTrapOptions {
    container: Ref<HTMLElement | null>
    active: Ref<boolean>
    initialFocus?: Ref<HTMLElement | null>
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        el => !el.closest('[inert]')
    )
}

function getInitialFocusTarget(container: HTMLElement, initialFocus?: HTMLElement | null): HTMLElement {
    // 1. initialFocus prop
    if (initialFocus) return initialFocus

    // 2. data-autofocus attribute
    const autofocus = container.querySelector<HTMLElement>('[data-autofocus]')
    if (autofocus) return autofocus

    // 3. first focusable element
    const focusable = getFocusableElements(container)
    if (focusable.length > 0) return focusable[0]

    // 4. container itself
    container.setAttribute('tabindex', '-1')
    return container
}

export function useFocusTrap(options: UseFocusTrapOptions): void {
    const { container, active, initialFocus } = options

    let previousFocus: HTMLElement | null = null

    function onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Tab') return

        const el = container.value
        if (!el) return

        const focusable = getFocusableElements(el)
        if (focusable.length === 0) {
            event.preventDefault()
            return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey) {
            if (document.activeElement === first) {
                event.preventDefault()
                last.focus()
            }
        } else {
            if (document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
    }

    function activate(): void {
        const el = container.value
        if (!el) return

        previousFocus = document.activeElement as HTMLElement

        const target = getInitialFocusTarget(el, initialFocus?.value)
        target.focus({ preventScroll: true })

        document.addEventListener('keydown', onKeydown)
    }

    function deactivate(): void {
        document.removeEventListener('keydown', onKeydown)

        if (previousFocus && document.contains(previousFocus)) {
            previousFocus.focus({ preventScroll: true })
        }

        previousFocus = null
    }

    watch(active, (isActive) => {
        if (isActive) activate()
        else deactivate()
    }, { immediate: true })

    onUnmounted(deactivate)
}