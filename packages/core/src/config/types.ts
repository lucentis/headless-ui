/**
 * Application-wide defaults, provided once with `provideConfig`.
 * Per-instance behavior belongs in the props of each composable instead.
 */
export interface HeadlessUIConfig {
    /** Reserved: no composable reads this yet. Overlays currently rely on the consumer's `<Teleport>`. */
    portalTarget?: string | HTMLElement
    /** How the page scrollbar width is compensated while a modal dialog locks the scroll. Defaults to `'padding'`. */
    scrollLock?: 'padding' | 'margin' | 'none'
    /** Whether a click outside closes popovers, menus and selects, and a click on the dialog overlay closes the dialog. Defaults to `true`. */
    closeOnOutsideClick?: boolean
    /** Whether the Escape key closes dialogs, popovers, menus, selects and tooltips. Defaults to `true`. */
    closeOnEscape?: boolean
    /** Exit animation duration in milliseconds. `isPresent` stays `true` for this long after closing. Defaults to `0`. */
    animationDuration?: number
    /** Reserved: no composable reads this yet. */
    dir?: 'ltr' | 'rtl'
    /** Prefix of generated ids when a composable does not pass its own. Defaults to `'headless'`. */
    idPrefix?: string
}
