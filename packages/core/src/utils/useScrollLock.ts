import { onUnmounted } from 'vue'
import { useConfig } from '../config'

// module-level — shared across all instances
let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''
let originalMarginRight = ''

function applyLock(mode: 'padding' | 'margin' | 'none'): void {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    originalOverflow = document.body.style.overflow
    originalPaddingRight = document.body.style.paddingRight
    originalMarginRight = document.body.style.marginRight

    document.body.style.overflow = 'hidden'

    if (mode === 'padding' && scrollbarWidth > 0) {
        const current = parseInt(window.getComputedStyle(document.body).paddingRight, 10)
        document.body.style.paddingRight = `${current + scrollbarWidth}px`
    }

    if (mode === 'margin' && scrollbarWidth > 0) {
        const current = parseInt(window.getComputedStyle(document.body).marginRight, 10)
        document.body.style.marginRight = `${current + scrollbarWidth}px`
    }
}

function restoreLock(): void {
    document.body.style.overflow = originalOverflow
    document.body.style.paddingRight = originalPaddingRight
    document.body.style.marginRight = originalMarginRight
}

export function useScrollLock() {
    const config = useConfig()
    let instanceLocked = false

    function lock(): void {
        if (instanceLocked) return

        instanceLocked = true
        lockCount++

        if (lockCount === 1) {
            applyLock(config.scrollLock)
        }

        console.log('lockCount: ', lockCount);
        
    }

    function unlock(): void {
        if (!instanceLocked) return

        instanceLocked = false
        lockCount--

        if (lockCount === 0) {
            restoreLock()
        }

        console.log('lockCount: ', lockCount);
    }

    onUnmounted(unlock)

    return { lock, unlock }
}