import { ref, toValue } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface UseHighlightOptions {
    loop?: boolean
    skipDisabled?: boolean
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
    disabled?: ComputedRef<boolean>
}

export function useHighlight(registry: Ref<HighlightItem[]>, options: UseHighlightOptions = {}): UseHighlightReturn {
    const { loop = false, skipDisabled = false } = options
    const highlightValue = ref<string | null>(null)

    function getNavigable(): HighlightItem[] {
        return skipDisabled ? registry.value.filter((item) => !toValue(item.disabled)) : registry.value
    }

    function highlight(value: string): void {
        const item = registry.value.find((item) => item.value === value)

        if (!item) return
        if (skipDisabled && toValue(item.disabled)) return

        highlightValue.value = value
    }

    function highlightFirst(): void {
        const items = getNavigable()
        if (items.length === 0) return

        highlightValue.value = items[0].value
    }

    function highlightLast(): void {
        const items = getNavigable()
        if (items.length === 0) return

        highlightValue.value = items[items.length - 1].value
    }

    function highlightNext(): void {
        const items = getNavigable()
        if (items.length === 0) return

        if (highlightValue.value === null) {
            highlightValue.value = items[0].value
            return
        }

        const index = items.findIndex((item) => item.value === highlightValue.value)

        if (index === -1) return

        if (index === items.length - 1) {
            if (loop) highlightValue.value = items[0].value
        } else {
            highlightValue.value = items[index + 1].value
        }
    }

    function highlightPrev(): void {
        const items = getNavigable()
        if (items.length === 0) return

        if (highlightValue.value === null) {
            highlightValue.value = items[items.length - 1].value
            return
        }

        const index = items.findIndex((item) => item.value === highlightValue.value)

        if (index === -1) return

        if (index === 0) {
            if (loop) highlightValue.value = items[items.length - 1].value
        } else {
            highlightValue.value = items[index - 1].value
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
