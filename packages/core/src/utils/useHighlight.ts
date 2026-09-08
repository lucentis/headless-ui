import { ref } from 'vue'
import type { Ref } from 'vue'

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

export function useHighlight(registry: Ref<string[]>): UseHighlightReturn {
    const highlightValue = ref<string | null>(null)

    function highlight(value: string): void {
        highlightValue.value = value
    }

    function highlightFirst(): void {
        if (registry.value.length > 0) highlightValue.value = registry.value[0]
    }

    function highlightLast(): void {
        if (registry.value.length > 0) highlightValue.value = registry.value[registry.value.length - 1]
    }

    function highlightNext(): void {
        const items = registry.value
        if (items.length === 0) return
        if (highlightValue.value === null) {
            highlightValue.value = items[0]
            return
        }
        const index = items.indexOf(highlightValue.value)
        const next = items[index + 1]
        if (next !== undefined) highlightValue.value = next
    }

    function highlightPrev(): void {
        const items = registry.value
        if (items.length === 0) return
        if (highlightValue.value === null) {
            highlightValue.value = items[items.length - 1]
            return
        }
        const index = items.indexOf(highlightValue.value)
        const prev = items[index - 1]
        if (prev !== undefined) highlightValue.value = prev
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