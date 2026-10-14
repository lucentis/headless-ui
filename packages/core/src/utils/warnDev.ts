export function warnDev(source: string, message: string): void {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Headless UI] ${source}: ${message}`)
    }
}
