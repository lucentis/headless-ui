import type { HeadlessUIConfig } from './types'

export const defaults: Required<HeadlessUIConfig> = {
    portalTarget: 'body',
    scrollLock: 'padding',
    closeOnOutsideClick: true,
    closeOnEscape: true,
    animationDuration: 0,
    dir: 'ltr',
    idPrefix: 'headless',
}