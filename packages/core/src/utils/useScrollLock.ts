import { onUnmounted } from 'vue'
import { useConfig } from '../config'

export function useScrollLock() {
    const config = useConfig()
    let originalPaddingRight = ''
    let originalOverflow = ''
    let locked = false

    function lock(): void {
        if (locked) return

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

        originalOverflow = document.body.style.overflow
        originalPaddingRight = document.body.style.paddingRight

        document.body.style.overflow = 'hidden'

        if (config.scrollLock === 'padding' && scrollbarWidth > 0) {
        const currentPadding = parseInt(window.getComputedStyle(document.body).paddingRight, 10)
        document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
        }

        if (config.scrollLock === 'margin' && scrollbarWidth > 0) {
        const currentMargin = parseInt(window.getComputedStyle(document.body).marginRight, 10)
        document.body.style.marginRight = `${currentMargin + scrollbarWidth}px`
        }

        locked = true
    }

    function unlock(): void {
        if (!locked) return
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
        locked = false
    }

    onUnmounted(unlock)

    return { lock, unlock }
}