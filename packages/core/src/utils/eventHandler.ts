// internal only — not exported from the package
// user handler runs first, internal handler runs second unless user called event.preventDefault()
export function composeEventHandlers<E extends Event>(
    userHandler: ((event: E) => void) | undefined,
    internalHandler: (event: E) => void,
): (event: E) => void {
    return (event: E) => {
        userHandler?.(event)
        if (!event.defaultPrevented) {
            internalHandler(event)
        }
    }
}

// for handlers that do not receive a DOM event (e.g. onClick: () => void)
export function composeHandlers(
    userHandler: (() => void) | undefined,
    internalHandler: () => void,
): () => void {
    return () => {
        userHandler?.()
        internalHandler()
    }
}