export type AriaRole =
    | 'dialog'
    | 'alertdialog'
    | 'listbox'
    | 'option'
    | 'combobox'
    | 'menu'
    | 'menuitem'
    | 'menuitemcheckbox'
    | 'menuitemradio'
    | 'tab'
    | 'tablist'
    | 'tabpanel'
    | 'region'
    | 'group'
    | 'separator'
    | 'tooltip'
    | 'status'
    | 'alert'

export type AriaHasPopup =
    | boolean
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
    | 'dialog'

export type AriaOrientation = 'horizontal' | 'vertical'

export type AriaLive = 'off' | 'polite' | 'assertive'