import { ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useConfig } from '../config'

export function usePresence(isOpen: ComputedRef<boolean> | Ref<boolean>): Ref<boolean> {
    const config = useConfig()
    const isPresent = ref(isOpen.value)

    let timer: ReturnType<typeof setTimeout> | null = null

    watch(isOpen, (open) => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }

        if (open) {
            // enter — immediately present
            isPresent.value = true
            return
        }

        // exit — stay present for the animation window, then unmount
        const duration = config.animationDuration
        if (duration === 0) {
            isPresent.value = false
            return
        }

        timer = setTimeout(() => {
            isPresent.value = false
            timer = null
        }, duration)
    })

    return isPresent
}