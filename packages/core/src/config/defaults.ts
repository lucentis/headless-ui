import type { HeadlessUIConfig } from './types'

export const defaults: Required<HeadlessUIConfig> = {
    portalTarget: 'body',
    scrollLock: 'padding',
    closeOnOutsideClick: true,
    closeOnEscape: true,
    animationDuration: 1000,
    dir: 'ltr',
    idPrefix: 'headless',
}