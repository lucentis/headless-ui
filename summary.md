# @lucentis/headless-ui — Architecture Bible

---

## 1. Architecture

`@lucentis/headless-ui` is a renderless Vue component library built around two layers:

```text
@lucentis/headless-ui
│
├── API layer
│   └── renderless composables, utilities, context, types
│
└── Component layer
    └── shipped Vue components built on top of the API layer
```

The dependency direction is strictly one-way:

```text
Component layer
      ↓
   API layer
      ↓
 Vue / external dependencies
```

The API layer must never import from the component layer.

The internal repository mirrors this architecture:

```text
packages/
├── core/
└── components/
```

**Status:** `packages/components` does not exist yet. The repository currently contains `packages/core` and `packages/playground`.

Published package:

```text
@lucentis/headless-ui
@lucentis/headless-ui/core
```

The package exposes both layers through separate entry points.

### API layer

The API layer provides the behavior, state management, accessibility logic, DOM contracts and reusable utilities required to build headless components.

Examples:

```text
useAccordion
useTabs
useSelect
useListbox
useMenu
useDialog
usePopover
...
```

Consumers may use these APIs directly to build their own components.

### Component layer

The component layer provides ready-to-use Vue components built on top of the API layer.

Example:

```vue
<Tabs>
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>

  <TabsContent value="one">
    ...
  </TabsContent>
</Tabs>
```

The component layer is therefore an implementation and presentation layer over the API layer, not a separate behavioral implementation.

---

# 2. Two levels of consumption

The library intentionally supports two levels of use.

## Level 1 — API layer

Advanced consumers can use the composables directly.

```ts
const api = useCollapsible({
    defaultOpen: false,
})
```

They own the rendered DOM.

```vue
<button v-bind="api.bindings.trigger">
  Toggle
</button>

<div v-if="api.state.isPresent" v-bind="api.bindings.content">
  Content
</div>
```

This level provides maximum control.

---

## Level 2 — Component layer

Consumers can use the shipped components.

```vue
<Collapsible v-model:open="isOpen">
  <CollapsibleTrigger>
    Toggle
  </CollapsibleTrigger>

  <CollapsibleContent>
    Content
  </CollapsibleContent>
</Collapsible>
```

The component layer internally consumes the API layer and exposes a higher-level Vue component model.

---

## 2.1 Custom component layer

Advanced consumers can also build their own compound components using the API layer.

```ts
const api = useCollapsible(props)

provideCollapsibleContext(api)
```

Child components consume the API through context:

```ts
const api = useCollapsibleContext()
```

This creates the following flow:

```text
useCollapsible()
      ↓
   CollapsibleApi
      ↓
provideCollapsibleContext()
      ↓
┌─────────────────────────┐
│ Custom component family │
├─────────────────────────┤
│ Trigger                 │
│ Content                 │
│ Other children          │
└─────────────────────────┘
```

---

# 3. Public API vs internal API

Not everything required internally by the component layer should become part of the public API.

The library distinguishes between:

```text
Public API
    ↓
Consumer-facing composables, context, types and selected utilities

Internal API
    ↓
Implementation details required for component coordination
```

## Public API

Public APIs are intentionally designed for consumers who build their own components.

Examples:

```text
useAccordion
useTabs
useSelect
useListbox
useMenu
useDialog

useControllableState
useOpenState
usePresence
useRegistry
useHighlight
useArrowNavigation
useRovingFocus
useTypeahead
useFocusTrap
usePortal
...
```

**Status:** `useRegistry` and `useHighlight` are internal for now (not exported from the public index). `useDismiss` is exported publicly. `useRovingFocus`, `useTypeahead` and `usePortal` do not exist yet. See section 44.

## Internal API

Internal APIs exist only to coordinate the library's own components.

Examples include:

```text
internal keys
internal stores
child registration details
component-specific coordination
```

Internal APIs must not be exposed merely because a shipped component needs them.

The purpose is architectural encapsulation, not security.

---

# 4. Naming conventions

| Thing             | Convention                    | Example                            |
| ----------------- | ----------------------------- | ---------------------------------- |
| Component files   | PascalCase                    | `Dialog.vue`                       |
| Composable files  | camelCase + `use` prefix      | `useDialog.ts`                     |
| Context files     | PascalCase + `Context` suffix | `DialogContext.ts`                 |
| Test files        | match source file             | `useDialog.test.ts`                |
| Barrel files      | lowercase                     | `index.ts`                         |
| Props interface   | `UseXProps`                   | `UseDialogProps`                   |
| State interface   | `XState`                      | `DialogState`                      |
| Actions interface | `XActions`                    | `DialogActions`                    |
| Bindings          | `XBindings`                   | `DialogBindings`                   |
| API interface     | `XApi`                        | `DialogApi`                        |
| Registry item     | `XRegistryItem`               | `TabsRegistryItem`                 |
| Internal keys     | `XInternals` + `XInternalKey` | `MenuInternals`, `MenuInternalKey` |

---

# 5. Component API contract

Every public component API follows the same conceptual shape:

```ts
interface ComponentApi<TState, TActions, TBindings> {
    state: Readonly<TState>
    actions: TActions
    bindings: TBindings
}
```

The contract is:

```text
state
    ↓
read-only reactive component state

actions
    ↓
imperative operations

bindings
    ↓
DOM attributes + event handlers
```

The API layer and component layer both rely on this contract.

Compound APIs that own overlay content additionally return `triggerRef` and `contentRef` (Dialog returns `contentRef` only), which the consumer attaches to the DOM elements used for focus and outside-click handling. A part with nothing to expose is typed `Record<never, never>`.

---

## 5.1 State

State describes what the component currently is.

```ts
api.state.isOpen
api.state.isDisabled
api.state.selectedValue
```

Consumers read state but do not mutate it directly.

---

## 5.2 Actions

Actions expose operations that change component behavior.

```ts
api.actions.open()
api.actions.close()
api.actions.toggle()
```

Actions return `void`.

Consumers use state when they need to inspect the result of an operation.

---

## 5.3 Element bindings

Element bindings contain everything required to make a DOM element behave correctly.

```ts
bindings.trigger
bindings.content
bindings.panel
bindings.root
```

Each element receives one object that contains:

- DOM attributes
- ARIA attributes
- IDs
- `data-*` attributes
- event handlers

The consumer should normally perform one spread per element.

```vue
<button v-bind="bindings.trigger">
  Toggle
</button>
```

No additional accessibility wiring should be required for behavior already owned by the library.

---

# 6. Typed APIs

Components that expose values use generics.

```ts
interface ListboxApi<TValue> extends ComponentApi<
    ListboxState<TValue>,
    ListboxActions<TValue>,
    ListboxBindings<TValue>
> {}
```

The value type must flow through the complete API.

```text
TValue
  ↓
props
  ↓
state
  ↓
actions
  ↓
registry
  ↓
selection / navigation
```

Components without a value type do not require a generic.

**Status:** no generic `TValue` is threaded through the API yet. Values are currently typed `string` / `string[]`.

---

# 7. Props architecture

Every composable receives one props object.

Correct:

```ts
useCollapsible(props)
```

Incorrect:

```ts
useCollapsible(open, disabled)
```

This keeps APIs consistent and allows Vue component props and direct composable usage to share the same contract.

---

## 7.1 MaybeRef

Behavioral and controllable props accept Vue `MaybeRef` where reactivity is meaningful.

```ts
interface UseCollapsibleProps {
    open?: MaybeRef<boolean>
    defaultOpen?: boolean
    onOpenChange?: (value: boolean) => void
    disabled?: MaybeRef<boolean>
}
```

Vue's `toValue()` is used internally.

No custom ref-unwrapping utility is required.

---

# 8. Controlled and uncontrolled state

Components with controllable state support both modes.

```text
defaultX
    ↓
uncontrolled
library owns state

x
    ↓
controlled
consumer owns state

onXChange
    ↓
notification when state should change
```

Example:

```ts
interface UseOpenStateProps {
    open?: MaybeRef<boolean>
    defaultOpen?: boolean
    onOpenChange?: (value: boolean) => void
}
```

Callback naming:

```text
on + PropName + Change
```

Examples:

```ts
onOpenChange
onValueChange
onCheckedChange
```

---

# 9. State primitives

Cross-component state patterns are extracted into reusable primitives.

## `useControllableState<T>`

Foundation for controlled/uncontrolled state.

```ts
const { value, setValue } = useControllableState({
    value: props.open,
    defaultValue: false,
    onChange: props.onOpenChange,
})
```

Rules:

- controlled/uncontrolled mode is determined at setup time
- mode must not switch at runtime
- setting the current value is a no-op
- callbacks are not fired for unchanged values
- generic `T` handles arbitrary state types

---

## `useOpenState`

Common abstraction for boolean open/close state.

Provides:

```text
isOpen
isPresent
open()
close()
toggle()
setOpen()
```

Used by components with open/close semantics.

It accepts an optional `animationDuration`, forwarded to `usePresence`. It never reads global configuration.

---

## `usePresence`

Separates logical visibility from DOM presence.

```text
isOpen
   ↓
logical state

isPresent
   ↓
DOM presence
```

When closing:

```text
isOpen = false
isPresent = true
      ↓
animationDuration
      ↓
isPresent = false
```

When `animationDuration === 0`:

```text
isPresent === isOpen
```

No timer is created.

The duration is an explicit parameter (default `0`). `usePresence` never reads global configuration; the component API passes `config.animationDuration` through `useOpenState`.

---

# 10. State conventions

State is:

- read-only
- reactive
- intended for rendering and inspection
- never directly mutated by consumers

Boolean state uses the `isX` convention.

Examples:

```ts
isOpen
isDisabled
isSelected
isActive
isPresent
isEmpty
```

IDs belong to state when they are meaningful component-level identifiers that consumers may need for custom composition.

Example:

```ts
interface CollapsibleState {
    isOpen: boolean
    isPresent: boolean
    isDisabled: boolean
    triggerId: string
    contentId: string
}
```

State objects are built with `const state: XState = reactive({ isOpen, isPresent, ... })`. Refs and computed values are passed directly and unwrapped by `reactive`, so consumers never handle `.value`. A value read from props goes through `computed(() => toValue(props.x))` (or `toRef(() => props.x)` for a plain prop) so it stays live. State is not made read-only: values are meant to be changed through `actions`, and anything beyond that is the consumer's responsibility.

---

# 11. Navigation and interaction state

Interactive components distinguish between:

```text
selected
focused
highlighted / active
```

These concepts must not be conflated.

For example:

```text
selectedValue
    ↓
currently selected value

active/highlighted value
    ↓
value currently targeted by keyboard navigation

focused value
    ↓
element currently receiving focus in patterns such as Tabs
```

The exact state terminology follows the semantics of the component while maintaining consistent conventions across the library.

Keyboard or hover targeting is exposed as `data-highlighted` (not `data-active`) to distinguish it from selection.

---

# 12. Registry architecture

Dynamic compound components use registries when children need to be discovered, coordinated or navigated.

The generic registry abstraction is:

```text
useRegistry
    ↓
register
unregister
items
lookup
```

Components provide their own registry item type.

Examples:

```text
TabsRegistryItem
ListboxRegistryItem
SelectRegistryItem
MenuRegistryItem
```

The registry is infrastructure, not component-specific business logic.

It allows parent and child components to coordinate without hard-coding child instances.

Typical flow:

```text
Child mounts
    ↓
register(item)

Child updates
    ↓
registry updates

Child unmounts
    ↓
unregister(item)
```

`useRegistry` is reusable by consumers building their own compound components.

---

# 13. Highlight and navigation

Navigation is separated into distinct responsibilities.

```text
Registry
    ↓
knows available items

Highlight
    ↓
knows which item is currently targeted

Navigation
    ↓
decides how movement occurs
```

`useHighlight` manages the current highlighted/targeted item.

Navigation utilities consume the registry and highlight state where appropriate.

This prevents keyboard navigation logic from being tightly coupled to individual components.

Disabled items are skipped automatically. Every registry item that can be disabled stores `disabled: ComputedRef<boolean>` (the same field name in every registry), and `useHighlight` reads it with `toValue(item.disabled)` at navigation time. No watcher is needed to keep the registry in sync.

---

# 14. Navigation utilities

Utilities are created when a real component requires them.

They are not created speculatively.

## `useArrowNavigation`

Moves through a flat set of registered items.

Used by patterns such as:

```text
Listbox
Menu
Select
```

## `useRovingFocus`

Maintains one tab stop within a group.

Used by patterns such as:

```text
Tabs
RadioGroup
Toolbar
```

**Status:** not implemented yet. Tabs currently handles its own `tabindex` through `useHighlight`.

## `useTypeahead`

Allows users to jump to matching items by typing.

Used by patterns such as:

```text
Listbox
Menu
Select
```

**Status:** not implemented yet.

These utilities are public because advanced consumers may need the same interaction primitives when building custom components.

---

# 15. Keyboard handling

Keyboard values live in one shared constant.

```ts
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
    Delete: 'Delete',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
} as const

export type Key = (typeof Keys)[keyof typeof Keys]
```

**Status:** `Delete`, `PageUp` and `PageDown` are not in the code yet. Add them when a component needs them.

Component code must not use raw keyboard strings when the key exists in `Keys`.

Handled keyboard events call `preventDefault()` when required by the interaction pattern.

`stopPropagation()` is not used by default.

If it is required, the reason must be documented.

---

# 16. Context

Compound component families use context to share their API.

Each component family has exactly two context functions:

```ts
provideXContext()
useXContext()
```

The context contains the complete public `XApi`.

Nothing additional is placed into the context.

Example:

```ts
const CollapsibleContextKey = Symbol('CollapsibleContext')
```

Provider:

```ts
provideCollapsibleContext(api)
```

Consumer:

```ts
const api = useCollapsibleContext()
```

Calling the consumer outside its provider throws.

There is no nullable context variant.

Every sub-composable (`useAccordionItem`, `useTabsTrigger`, `useMenuItem`, ...) also accepts its parent `XApi` as an optional second argument. This bypasses context injection for same-`setup()` usage, since Vue cannot `inject` a value provided by the same component.

Context is the bridge between the API layer and compound component children.

```text
Parent component
    ↓
useX()
    ↓
XApi
    ↓
provideXContext()
    ↓
Child components
    ↓
useXContext()
```

---

# 17. Internal coordination

Some compound components require child APIs or coordination mechanisms that should not become part of the public context contract.

These mechanisms use internal keys and internal APIs.

The principle is:

```text
Public API
    ↓
stable consumer contract

Internal API
    ↓
implementation coordination
```

Internal mechanisms may include:

- child registration
- internal stores
- internal keys
- component-specific coordination
- hidden child-facing operations

Internal visibility is an architectural boundary, not a security mechanism.

Implementation: each family that needs it has a symbol key (`MenuInternalKey`, `ListboxInternalKey`, `SelectInternalKey`, `TabsInternalKey`) in `packages/core/src/keys/internal-keys.ts`, exposed on the API as `readonly [XInternalKey]: XInternals`. `XRegistryItem` and `XInternals` are never exported from a public barrel.

---

# 18. Element bindings

Element bindings are the DOM contract between the API layer and the consumer.

Rules:

- one object per logical element
- DOM attributes and event handlers are merged
- ARIA attributes are included
- IDs are included
- `data-*` state is included
- no classes
- no styles
- no visual assumptions

Elements are named by role: `trigger`, `content`, `overlay`, `panel`, `list`, or `root` for single-element composables. The full shape of each bindings object is written in the composable itself, never assembled from a shared helper.

Example:

```ts
interface CollapsibleBindings {
    trigger: {
        id: string
        'aria-expanded': boolean
        'aria-controls': string
        'data-state': 'open' | 'closed'
        onClick: (event: MouseEvent) => void
        onKeydown: (event: KeyboardEvent) => void
    }

    content: {
        id: string
        role: 'region'
        'aria-labelledby': string
        'data-state': 'open' | 'closed'
    }
}
```

Consumer:

```vue
<button v-bind="bindings.trigger">
  Toggle
</button>

<div v-if="state.isPresent" v-bind="bindings.content">
  Content
</div>
```

---

# 19. Dynamic element bindings

Static elements expose plain objects.

Dynamic child elements expose getter functions.

Convention:

```text
getXBindings()
```

Example:

```ts
bindings.getOptionBindings(value)
```

This allows per-item state and event handlers to be generated from the item's value.

**Status:** the implementation uses per-item sub-composables instead (`useAccordionItem`, `useTabsTrigger`, `useMenuItem`, `useListboxOption`, `useSelectOption`), each returning its own bindings and taking the parent API as an optional second argument.

---

# 20. `data-state`

The API automatically exposes relevant state through `data-*` attributes.

Consumers do not manually recreate component state in the DOM.

Common values include:

```text
open
closed
active
inactive
selected
checked
unchecked
disabled
loading
```

Example:

```vue
<div v-if="state.isPresent" v-bind="bindings.content" />
```

The consumer can style:

```css
[data-state="open"] {
  ...
}

[data-state="closed"] {
  ...
}
```

The library provides the state contract; the consumer owns presentation.

---

# 21. Event composition

Internal and consumer handlers must coexist.

The consumer handler runs first. The internal handler runs afterwards, unless the consumer called `event.preventDefault()`.

The library uses an internal utility (`utils/eventHandler.ts`):

```ts
composeHandlers(userHandler, internalHandler)
```

It is not part of the public API. It is used by the Menu, Listbox and Select items.

Vue's normal event binding behavior is relied upon where appropriate.

The library must never silently discard consumer handlers.

---

# 22. Accessibility architecture

Accessibility is part of the API layer, not an optional enhancement of the component layer.

The library owns behavioral accessibility.

## Library responsibility

The library manages:

- required roles
- ARIA relationships
- ARIA states
- generated IDs
- focus management
- keyboard interactions
- focus restoration
- focus trapping
- modal background hiding
- live announcements where applicable

**Status:** modal background hiding (`aria-hidden` on siblings) and live announcements are not implemented yet.

## Consumer responsibility

The consumer provides semantic information specific to their content.

Examples:

- meaningful labels
- descriptions
- page landmarks
- application-specific accessible names

The library must not invent semantic meaning that only the consumer can know.

---

# 23. APG patterns

Components implement established WAI-ARIA Authoring Practices patterns where applicable.

| Component    | Pattern                             |
| ------------ | ----------------------------------- |
| Collapsible  | Disclosure                          |
| Dialog       | Dialog                              |
| AlertDialog  | Alert Dialog                        |
| Listbox      | Listbox                             |
| Combobox     | Combobox                            |
| Tabs         | Tabs                                |
| Accordion    | Accordion                           |
| DropdownMenu | Menu Button                         |
| Tooltip      | Tooltip                             |
| Popover      | Dialog / non-modal dialog semantics |

Each component should maintain an accessibility checklist covering:

```text
Roles
Relationships
States
Focus
Keyboard
```

The checklist should live close to the implementation so accessibility requirements remain visible during development.

---

# 24. ARIA types

Shared ARIA types live in the API layer.

Examples:

```ts
type AriaRole = ...

type AriaHasPopup =
  | boolean
  | 'menu'
  | 'listbox'
  | 'tree'
  | 'grid'
  | 'dialog'

type AriaOrientation =
  | 'horizontal'
  | 'vertical'

type AriaLive =
  | 'off'
  | 'polite'
  | 'assertive'
```

Only roles and ARIA values actually required by the library should be added.

**Status:** these types are declared and exported from `types/aria.ts`, but no composable uses them yet. Each composable currently types its roles and values inline.

---

# 25. Focus management

Focus management consists of separate concerns.

## Initial focus

When a component opens, initial focus follows this priority:

```text
1. explicit initialFocus
2. data-autofocus element
3. first focusable element
4. container with tabindex="-1"
```

---

## Return focus

The element that triggered opening is captured.

On close, focus is restored when the element still exists.

```ts
target.focus({
    preventScroll: true,
})
```

Removed targets are ignored safely.

---

## Focus trap

Modal components may trap focus inside their container.

```text
Tab
    ↓
next focusable element

Shift + Tab
    ↓
previous focusable element
```

Focus trapping is separate from initial and return focus.

**Status:** currently all three concerns are handled together by `useFocusTrap({ container, active, initialFocus })`, used by Dialog.

---

# 26. Portal

Overlays can render outside the normal component tree.

`usePortal` resolves a target from:

```text
instance target
    ↓
global config target
    ↓
default body
```

Each overlay owns its portal container.

Containers are marked:

```html
<div data-headless-portal></div>
```

The library does not own visual stacking order.

Z-index and visual presentation remain consumer concerns.

**Status:** not implemented yet. No `usePortal` exists and `portalTarget` is not consumed. Overlays currently rely on the consumer's `<Teleport>`.

---

# 27. Global configuration

Configuration is provided once at application level.

```ts
app.use(
    createHeadlessUI({
        idPrefix: 'myapp',
    }),
)
```

Default values are available without installing the plugin.

```ts
interface HeadlessUIConfig {
    portalTarget?: string | HTMLElement
    scrollLock?: 'padding' | 'margin' | 'none'
    closeOnOutsideClick?: boolean
    closeOnEscape?: boolean
    animationDuration?: number
    dir?: 'ltr' | 'rtl'
    idPrefix?: string
}
```

Defaults:

```text
portalTarget          body
scrollLock            padding
closeOnOutsideClick   true
closeOnEscape         true
animationDuration     0
dir                   ltr
idPrefix              headless
```

Instance props override global configuration where supported.

Configuration is reserved for behavior that is reasonable to standardize application-wide.

Per-instance behavior belongs in component props.

**Status:** configuration is currently provided through `provideConfig(config)` and read through `useConfig()` (`packages/core/src/config`). The `createHeadlessUI` plugin is not implemented.

## 27.1 Who reads configuration

Configuration is read by component APIs, never by utilities.

- **Utilities** (`useDismiss`, `usePresence`, `useScrollLock`, `useOpenState`, ...) are agnostic of configuration. They receive explicit parameters and carry their own standalone default.
- **Component APIs** (`useDialog`, `usePopover`, `useMenu`, ...) call `useConfig()` and pass the values down explicitly.
- **The component layer** exposes per-instance props that override configuration: `props.closeOnEscape ?? config.closeOnEscape`.

Example:

```ts
const config = useConfig()

const { isOpen, isPresent, close } = useOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    animationDuration: config.animationDuration,
})

useDismiss({
    active: isOpen,
    targets: [triggerRef, contentRef],
    onDismiss: close,
    escape: config.closeOnEscape,
    outsideClick: config.closeOnOutsideClick,
})
```

Because utilities accept `MaybeRef`, a per-instance override requires no change in the utilities.

Current usage:

| Component API                              | Reads                                                                     | Passes to                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `useDialog`                                | `animationDuration`, `scrollLock`, `closeOnEscape`, `closeOnOutsideClick` | `useOpenState`, `useScrollLock`, its own escape and overlay handlers |
| `usePopover`, `useMenu`, `useSelect`       | `animationDuration`, `closeOnEscape`, `closeOnOutsideClick`               | `useOpenState`, `useDismiss`                                         |
| `useAlert`, `useCollapsible`, `useTooltip` | `animationDuration`                                                       | `useOpenState`                                                       |

Pending: `useId` still falls back to `config.idPrefix`. Every call site passes an explicit prefix, so that branch is not reached today.

---

# 28. Props vs configuration

Use props when behavior varies between component instances.

Examples:

```text
disabled
loop
orientation
value
defaultValue
```

Use global configuration for application-wide defaults.

Examples:

```text
closeOnEscape
closeOnOutsideClick
portalTarget
animationDuration
dir
idPrefix
```

If a behavior commonly needs to differ between two instances on the same page, it should generally be a prop rather than configuration.

When a component API exposes such a behavior as a prop (for example `closeOnEscape`), it resolves `props.closeOnEscape ?? config.closeOnEscape` before passing the value to the utility.

**Status:** these override props are not on the component APIs yet.

---

# 29. Animation

The library ships no visual animation.

The consumer owns CSS and transitions.

The API provides two mechanisms:

```text
data-state
isPresent
```

`data-state` allows CSS to distinguish logical state.

`isPresent` allows the consumer to keep an element mounted during exit animations.

```vue
<div v-if="state.isPresent" v-bind="bindings.panel" />
```

With:

```text
animationDuration = 0
```

there is no delayed presence behavior.

---

# 30. Utilities

Utilities are introduced only when a real component requires them.

No speculative utility layer is built upfront.

| Utility                | Purpose                          | Public |
| ---------------------- | -------------------------------- | ------ |
| `useControllableState` | Controlled/uncontrolled state    | Yes    |
| `useOpenState`         | Open/close state                 | Yes    |
| `usePresence`          | Exit presence                    | Yes    |
| `useId`                | Stable IDs                       | Yes    |
| `useRegistry`          | Dynamic child registration       | Yes    |
| `useHighlight`         | Highlighted item state           | Yes    |
| `useScrollLock`        | Body scroll locking              | Yes    |
| `useOutsideClick`      | Outside interaction              | Yes    |
| `useEscape`            | Escape handling                  | Yes    |
| `useDismiss`           | Escape + outside-click dismissal | Yes    |
| `useDisabled`          | Disabled state unwrapping        | Yes    |
| `useFocusTrap`         | Focus trapping                   | Yes    |
| `usePortal`            | Overlay portals                  | Yes    |
| `useArrowNavigation`   | Flat-list navigation             | Yes    |
| `useRovingFocus`       | Roving tabindex                  | Yes    |
| `useTypeahead`         | Typeahead navigation             | Yes    |
| `announce`             | Live announcements               | Yes    |
| `Keys`                 | Keyboard constants               | Yes    |
| `composeHandlers`      | Internal event composition       | No     |

A utility must have a concrete use case before becoming part of the core.

**Status:** not implemented yet: `usePortal`, `useRovingFocus`, `useTypeahead`, `announce`. Internal for now (not exported from the public index): `useRegistry`, `useHighlight`.

## 30.1 `useDismiss`

Wraps `useEscape` and `useOutsideClick` for anything that closes on Escape and on a click outside.

```ts
interface UseDismissOptions {
    active: MaybeRef<boolean>
    targets: Ref<HTMLElement | null>[]
    onDismiss: () => void
    escape?: MaybeRef<boolean> // default true
    outsideClick?: MaybeRef<boolean> // default true
}
```

Escape and outside click are enabled independently, so `onDismiss` never has to check a flag.

Example (Popover):

```ts
useDismiss({
    active: isOpen,
    targets: [triggerRef, contentRef],
    onDismiss: close,
    escape: config.closeOnEscape,
    outsideClick: config.closeOnOutsideClick,
})
```

`useDismiss` is agnostic of configuration (see 27.1).

Used by Popover, Menu and Select. Not used by:

- Dialog: it has no trigger and closes on a click on its own overlay, not on outside-click detection.
- Tooltip: it only reacts to Escape and is not gated by configuration.

`useDismiss` is covered by its own test suite (`useDismiss.test.ts`): Escape and outside click are tested independently, together, and reactively (each can be toggled on or off while active).

What is deliberately not shared: ids, refs, open state and bindings stay in each composable. The shared piece is only what is identical across Popover, Menu and Select, the dismissal wiring. A previous attempt (`useOverlayTrigger`) also generated ids, refs and part of the bindings. It was rejected because each bindings object could no longer be read in a single file.

---

# 31. Component family structure

A compound component family generally follows:

```text
X
├── XContext
├── XRoot
├── XTrigger
├── XContent
└── other semantic children
```

The exact component structure depends on the APG pattern.

The parent owns the API.

Children consume the API through context and/or narrowly scoped internal coordination.

---

# 32. Public exports

Each component family exposes:

```ts
export { useCollapsible }

export { provideCollapsibleContext, useCollapsibleContext }

export type { UseCollapsibleProps, CollapsibleApi, CollapsibleState, CollapsibleActions, CollapsibleBindings }
```

Public exports should expose intentional contracts, not implementation details.

---

# 33. Shipped component implementation

A shipped component should primarily compose the API layer.

Conceptually:

```text
Component
    ↓
useX()
    ↓
XApi
    ↓
provideXContext()
    ↓
render children
```

The component layer must not reimplement behavior already provided by the API layer.

This keeps:

```text
custom implementation
        and
shipped implementation
```

on the same behavioral foundation.

---

# 34. Slot props

When shipped components expose slot props, they use the same conceptual API shape.

```vue
<slot :state="state" :actions="actions" :bindings="bindings" />
```

No second state model is introduced for slots.

The same API remains the source of truth.

---

# 35. IDs

IDs are generated through the shared `useId` infrastructure.

IDs must be:

- stable
- unique
- deterministic within their instance
- compatible with the configured `idPrefix`

IDs are generated once per composable and used to build the bindings objects (`bindings.trigger.id`, `bindings.content['aria-labelledby']`, ...).

**Status:** ids are no longer duplicated onto `state` (`triggerId`, `contentId`, `titleId`, `descriptionId`, `listId`, `listboxId`, `optionId` were removed from every `XState`). `bindings.*.id` was already the same value and is the only place to read an id from now; nothing outside a composable's own bindings construction ever read the `state` copy. `useId(prefix)` still falls back to `config.idPrefix` when called without a prefix, but every call site passes an explicit prefix, so that branch is not reached. Whether `useId` keeps reading configuration is pending (see 27.1 and 44).

---

# 36. Disabled state

Disabled behavior is component state, not global configuration.

Examples:

```ts
disabled?: MaybeRef<boolean>
```

Disabled state must affect all relevant interaction surfaces:

```text
mouse
keyboard
focus
ARIA
selection
navigation
```

The exact DOM behavior depends on the component's semantic element.

`useDisabled(disabled)` unwraps a `MaybeRef<boolean>` into a `ComputedRef<boolean>`. Because a composable cannot know whether the consumer renders a native or a non-native element, both `aria-disabled` and `disabled` are exposed in the bindings, along with `data-disabled`.

---

# 37. Dependency rules

The core layer must never import from components.

```text
components → core
```

Allowed:

```ts
import { useRegistry } from '@lucentis/headless-ui/core'
```

Forbidden:

```text
core → components
```

The dependency boundary exists to keep the API layer independently reusable.

---

# 38. Build output

The package publishes:

- ESM
- declaration files
- source maps
- declaration maps

No CommonJS build.

No minification.

Consumer bundlers are responsible for final optimization.

Vue is external.

Only the intended distribution files are published.

---

# 39. Versioning

The public API is semver-stable.

Breaking changes to core public contracts require a major version.

Particular care is required for:

```text
ComponentApi
public composable signatures
public state contracts
public action contracts
public element bindings
public context APIs
generic contracts
```

Internal implementation details may evolve without being considered public API changes.

---

# 40. Build order

The component roadmap follows increasing interaction and architectural complexity.

### Phase 1 — Stateless primitives ✓

```text
Button
Badge            (skipped, no headless behavior)
Alert
Separator
VisuallyHidden   (skipped, no headless behavior)
```

### Phase 2 — Single-state components ✓ (partial)

```text
Collapsible
Switch            (deprioritized)
Checkbox          (deprioritized)
```

### Phase 3 — Compound components without overlays ✓ (partial)

```text
Accordion
Tabs
RadioGroup        (not started)
```

### Phase 4 — Overlays ✓

```text
Dialog
Popover
Tooltip
```

### Phase 5 — Menus (partial)

```text
DropdownMenu      (useMenu, done)
ContextMenu       (not started)
NavigationMenu    (not started)
```

### Phase 6 — Complex form controls ✓

```text
Listbox
Combobox          (covered by Select)
Select
```

### Phase 7 — Feedback (not started)

```text
Toast
Progress
```

### Phase 8 — Remaining form controls (not started)

```text
Input
Textarea
NumberInput
DatePicker
```

The roadmap is implementation order, not an architectural hierarchy.

---

# 41. Testing architecture

Tests are colocated with the implementation they cover.

```text
useTabs.ts
useTabs.test.ts
```

Lifecycle-dependent composables are tested inside mounted Vue components.

DOM side effects are reset between tests.

Tests verify behavior rather than implementation details.

When module-level state cannot be reset safely, tests must focus on relative behavior rather than exact generated values.

Test environment:

```text
happy-dom
```

Important test categories include:

```text
state transitions
controlled/uncontrolled behavior
ARIA output
keyboard behavior
focus management
registry lifecycle
child registration
context errors
DOM bindings
event composition
portal behavior
presence / animation timing
```

---

# 42. Architectural principles

The project follows these principles:

### Behavior before rendering

The API layer owns behavior.

The component layer owns Vue rendering.

### One source of truth

State, accessibility and interaction logic must not be duplicated between layers.

### Explicit contracts

`state`, `actions` and `bindings` form the public API contract.

### Composition over inheritance

Components are built from composables and utilities.

### Generic infrastructure

Cross-component mechanisms such as registry, highlight and navigation are extracted when their abstraction becomes justified by real use cases.

### Accessibility by default

Required accessibility behavior belongs to the library, not the consumer.

### No styling assumptions

The library never owns classes, styles or visual design.

### Public API restraint

A mechanism being useful internally does not automatically make it public.

### Progressive abstraction

Utilities are extracted when real components demonstrate the need for them.

### Dependency direction

The component layer depends on the API layer, never the reverse.

### Design before coding

Architecture is thought through before implementation. Work is done feature by feature, and a problem is solved without touching every file.

### Utilities are agnostic of configuration

Utilities never read global configuration. Component APIs read it and pass explicit values down (see 27.1).

### Readable in one file

The full shape of `state`, `actions` and `bindings` is visible in the composable itself. A shared helper never generates part of a bindings object.

### Do not force an abstraction

A shared utility exists because several consumers repeat the exact same thing. When each consumer needs variations, or would use only a fraction of what the utility offers, the abstraction is the wrong shape (Dialog and `useDismiss`).

---

# 43. Mental model

The complete architecture can be reduced to:

```text
                         CONSUMER
                            │
             ┌──────────────┴──────────────┐
             │                             │
       Shipped components             Custom components
             │                             │
             └──────────────┬──────────────┘
                            │
                         API layer
                            │
              ┌─────────────┼─────────────┐
              │             │             │
          composables    context      utilities
              │             │             │
              ├─────────────┼─────────────┤
              │             │             │
             state       registry     navigation
              │             │             │
              └─────────────┼─────────────┘
                            │
                     DOM / ARIA contract
                            │
                           Vue
```

The fundamental rule is:

```text
API layer defines WHAT the component does.
Component layer defines HOW the component is composed in Vue.
Consumer defines HOW it looks.
```

That separation is the core architectural identity of `@lucentis/headless-ui`.

---

# 44. Current status and open items

Implemented in `packages/core`:

```text
Component APIs
    useButton, useSeparator, useAlert, useCollapsible, useAccordion, useTabs,
    useDialog, useTooltip, usePopover, useMenu, useListbox, useSelect

Utilities
    useControllableState, useOpenState, usePresence, useDisabled, useId,
    useRegistry, useHighlight, useArrowNavigation, useEscape, useOutsideClick,
    useDismiss, useFocusTrap, useScrollLock, Keys, composeHandlers
```

Open items:

- `useId` still reads `config.idPrefix` (that branch is not reached today).
- `useDismiss` is now exported from the public index, with tests (`useDismiss.test.ts`). `useRegistry` and `useHighlight` remain internal by design (child-registration coordination, not a public contract).
- Add `closeOnEscape` / `closeOnOutsideClick` (and scroll lock, animation) props to component APIs so the component layer can override configuration per instance.
- Tooltip's Escape handling is not gated by configuration. Confirm intent.
- Shared ARIA types (`AriaRole`, `AriaHasPopup`, `AriaOrientation`, `AriaLive`) are declared but unused.
- `updateItem` / `updateOption` are still declared in Menu and Select internals. Nothing calls them.
- `HighlightItem` is a fixed shape, not generic over each `XRegistryItem`.
- Registry, highlight and arrow-navigation wiring is repeated across Listbox, Menu, Select and Tabs. Refactor only with a shape that keeps bindings in the composable.
- Not implemented: `usePortal`, `useRovingFocus`, `useTypeahead`, `announce`, the `createHeadlessUI` plugin.
- The `dir` and `portalTarget` config keys have no consumer yet.
- ESLint, Prettier and `.editorconfig` are not set up. Type errors are checked with `vue-tsc` (the StackBlitz editor does not display them).
