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

export interface HighlightItem {
    value: string
}

export function useHighlight(
    registry: Ref<HighlightItem[]>,
    options: UseHighlightOptions = {}
): UseHighlightReturn {
    const { loop = false } = options
    const highlightValue = ref<string | null>(null)


    function highlight(value: string): void {
        const item = registry.value.find(item => item.value === value)

        if (!item) return

        highlightValue.value = value
    }

    function highlightFirst(): void {
        const first = registry.value[0]

        if (!first) return

        highlightValue.value = first.value
    }

    function highlightLast(): void {
        const last = registry.value[registry.value.length - 1]

        if (!last) return
    
        highlightValue.value = last.value
    }

    function highlightNext(): void {
        if (registry.value.length === 0) return

        if (highlightValue.value === null) {
            highlightValue.value = registry.value[0].value
            return
        }

        const index = registry.value.findIndex(item => item.value === highlightValue.value)

        if (index === -1) return

        if (index === registry.value.length - 1) {
            if (loop) highlightValue.value = registry.value[0].value
        } else {
            highlightValue.value = registry.value[index + 1].value
        }
    }

    function highlightPrev(): void {
        if (registry.value.length === 0) return
        
        if (highlightValue.value === null) {
            highlightValue.value = registry.value[registry.value.length - 1].value
            return
        }

        const index = registry.value.findIndex(item => item.value === highlightValue.value)

        if (index === -1) return

        if (index === 0) {
            if (loop) highlightValue.value = registry.value[registry.value.length - 1].value
        } else {
            highlightValue.value = registry.value[index - 1].value
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