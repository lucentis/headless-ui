import { toValue } from 'vue'
import type { MaybeRef } from 'vue'
import { Keys } from './keys'

export interface UseArrowNavigationOptions {
    orientation?: MaybeRef<'horizontal' | 'vertical'>
    onNext: () => void
    onPrev: () => void
    onFirst: () => void
    onLast: () => void
    onEnter?: () => void
    onSpace?: () => void
}

export function useArrowNavigation(options: UseArrowNavigationOptions): {
    onKeydown: (event: KeyboardEvent) => void
} {
    function onKeydown(event: KeyboardEvent): void {
        const orientation = toValue(options.orientation) ?? 'vertical'
        const nextKey = orientation === 'horizontal' ? Keys.ArrowRight : Keys.ArrowDown
        const prevKey = orientation === 'horizontal' ? Keys.ArrowLeft : Keys.ArrowUp

        switch (event.key) {
            case nextKey:
                event.preventDefault()
                options.onNext()
                break
            case prevKey:
                event.preventDefault()
                options.onPrev()
                break
            case Keys.Home:
                event.preventDefault()
                options.onFirst()
                break
            case Keys.End:
                event.preventDefault()
                options.onLast()
                break
            case Keys.Enter:
                if (options.onEnter) {
                    event.preventDefault()
                    options.onEnter()
                }
                break
            case Keys.Space:
                if (options.onSpace) {
                    event.preventDefault()
                    options.onSpace()
                }
                break
        }
    }

    return { onKeydown }
}