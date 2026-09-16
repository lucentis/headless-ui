import { ref } from 'vue'
import type { Ref } from 'vue'

export interface UseHighlightOptions {
    loop?: boolean
}

export interface UseHighlightReturn {
    highlightValue: Ref<string | null>
    highlight: (value: string) => void
    highlightFirst: () => void
    highlightLast: () => void
    highlightNext: () => void
    highlightPrev: () => void
    isHighlighted: (value: string) => boolean
    clearHighlight: () => void
}

export function useHighlight(
    registry: Ref<{ value: string; disabled?: boolean }[]>,
    options: UseHighlightOptions = {}
): UseHighlightReturn {
    const { loop = false } = options
    const highlightValue = ref<string | null>(null)

    function getEnabled(): { value: string; disabled?: boolean }[] {
        return registry.value.filter(item => !item.disabled)
    }

    function highlight(value: string): void {
        highlightValue.value = value
    }

    function highlightFirst(): void {
        const first = getEnabled()[0]
        if (first) highlightValue.value = first.value
    }

    function highlightLast(): void {
        const enabled = getEnabled()
        const last = enabled[enabled.length - 1]
        if (last) highlightValue.value = last.value
    }

    function highlightNext(): void {
        const enabled = getEnabled()
        if (enabled.length === 0) return

        if (highlightValue.value === null) {
            highlightValue.value = enabled[0].value
            return
        }

        const index = enabled.findIndex(i => i.value === highlightValue.value)
        if (index === -1) return  // stale highlight — no-op

        if (index === enabled.length - 1) {
            if (loop) highlightValue.value = enabled[0].value
        } else {
            highlightValue.value = enabled[index + 1].value
        }
    }

    function highlightPrev(): void {
        const enabled = getEnabled()
        if (enabled.length === 0) return

        if (highlightValue.value === null) {
            highlightValue.value = enabled[enabled.length - 1].value
            return
        }

        const index = enabled.findIndex(i => i.value === highlightValue.value)
        if (index === -1) return  // stale highlight — no-op

        if (index === 0) {
            if (loop) highlightValue.value = enabled[enabled.length - 1].value
        } else {
            highlightValue.value = enabled[index - 1].value
        }
    }

    function isHighlighted(value: string): boolean {
        return highlightValue.value === value
    }

    function clearHighlight(): void {
        highlightValue.value = null
    }

    return {
        highlightValue,
        highlight,
        highlightFirst,
        highlightLast,
        highlightNext,
        highlightPrev,
        isHighlighted,
        clearHighlight,
    }
}