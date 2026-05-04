import { computed, toValue } from 'vue'
import { useId } from '../../utils/useId'
import { useAccordionContext } from './AccordionContext'
import type { UseAccordionItemProps, AccordionItemApi, AccordionApi } from './types'

export function useAccordionItem(props: UseAccordionItemProps, accordion?: AccordionApi): AccordionItemApi {
    const accordionApi = accordion ?? useAccordionContext()

    const isDisabled = computed(() =>
        accordionApi.state.isDisabled || (toValue(props.disabled) ?? false)
    )
    const isExpanded = computed(() => accordionApi.actions.isExpanded(props.value))

    const triggerId = useId('accordion-trigger')
    const contentId = useId('accordion-content')

    const state: AccordionItemApi['state'] = {
        get isExpanded() { return isExpanded.value },
        get isDisabled() { return isDisabled.value },
        get triggerId() { return triggerId },
        get contentId() { return contentId },
    }

    const actions: AccordionItemApi['actions'] = {
        expand: () => accordionApi.actions.expand(props.value),
        collapse: () => accordionApi.actions.collapse(props.value),
        toggle: () => accordionApi.actions.toggle(props.value),
    }

    const triggerBindings = computed(() => ({
        id: triggerId,
        role: 'button' as const,
        'aria-expanded': isExpanded.value,
        'aria-controls': contentId,
        'aria-disabled': isDisabled.value ? (true as const) : undefined,
        'data-disabled': isDisabled.value ? ('' as const) : undefined,
        'data-state': isExpanded.value ? ('open' as const) : ('closed' as const),
        onClick: () => {
            if (!isDisabled.value) actions.toggle()
        },
    }))

    const contentBindings = computed(() => ({
        id: contentId,
        role: 'region' as const,
        'aria-labelledby': triggerId,
        'data-state': isExpanded.value ? ('open' as const) : ('closed' as const),
    }))

    const bindings: AccordionItemApi['bindings'] = {
        get trigger() { return triggerBindings.value },
        get content() { return contentBindings.value },
    }

    return { state, actions, bindings }
}