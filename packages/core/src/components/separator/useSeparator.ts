import { computed, toValue } from 'vue'
import type { UseSeparatorProps, SeparatorApi } from './types'

export function useSeparator(props: UseSeparatorProps = {}): SeparatorApi {
    const orientation = computed(() => toValue(props.orientation) ?? 'horizontal')
    const isDecorative = computed(() => toValue(props.decorative) ?? false)

    const state: SeparatorApi['state'] = {
        get orientation() { return orientation.value },
        get isDecorative() { return isDecorative.value },
    }

    const bindings: SeparatorApi['bindings'] = {
        get root() {
            return {
                role: isDecorative.value ? ('none' as const) : ('separator' as const),
                // aria-orientation is only set when vertical — horizontal is the implicit default per APG
                // omitted entirely when decorative since role="none" makes it meaningless
                'aria-orientation': (!isDecorative.value && orientation.value === 'vertical')
                    ? ('vertical' as const)
                    : undefined,
                'data-orientation': orientation.value,
            }
        },
    }

    return { state, actions: {}, bindings }
}