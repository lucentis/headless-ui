export function warnDev(source: string, message: string): void {
    if (import.meta.env.DEV) {
        console.warn(`[Headless UI] ${source}: ${message}`)
    }
}
