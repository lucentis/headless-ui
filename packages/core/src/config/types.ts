export interface HeadlessUIConfig {
    portalTarget?: string | HTMLElement
    scrollLock?: 'padding' | 'margin' | 'none'
    closeOnOutsideClick?: boolean
    closeOnEscape?: boolean
    animationDuration?: number
    dir?: 'ltr' | 'rtl'
    idPrefix?: string
}