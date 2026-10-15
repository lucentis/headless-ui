// Local declaration: the file type-checks in every project that imports the core sources.
// The consumer's bundler replaces process.env.NODE_ENV at build time.
declare const process: { env: { NODE_ENV?: string } }

export function warnDev(source: string, message: string): void {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Headless UI] ${source}: ${message}`)
    }
}
