export const Keys = {
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Home: 'Home',
    End: 'End',
    Enter: 'Enter',
    Space: ' ',
    Escape: 'Escape',
    Tab: 'Tab',
    Backspace: 'Backspace',
} as const

export type Key = typeof Keys[keyof typeof Keys]