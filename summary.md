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
<button v-bind="api.props.trigger">
  Toggle
</button>

<div
  v-if="api.state.isPresent"
  v-bind="api.props.content"
>
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

| Thing             | Convention                    | Example              |
| ----------------- | ----------------------------- | -------------------- |
| Component files   | PascalCase                    | `Dialog.vue`         |
| Composable files  | camelCase + `use` prefix      | `useDialog.ts`       |
| Context files     | PascalCase + `Context` suffix | `DialogContext.ts`   |
| Test files        | match source file             | `useDialog.test.ts`  |
| Barrel files      | lowercase                     | `index.ts`           |
| Props interface   | `UseXProps`                   | `UseDialogProps`     |
| State interface   | `XState`                      | `DialogState`        |
| Actions interface | `XActions`                    | `DialogActions`      |
| Element props     | `XElementProps`               | `DialogElementProps` |
| API interface     | `XApi`                        | `DialogApi`          |
| Registry item     | `XRegistryItem`               | `TabsRegistryItem`   |

---

# 5. Component API contract

Every public component API follows the same conceptual shape:

```ts
interface ComponentApi<TState, TActions, TElementProps> {
  state: Readonly<TState>
  actions: TActions
  props: TElementProps
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

props
    ↓
DOM attributes + event handlers
```

The API layer and component layer both rely on this contract.

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

## 5.3 Element props

Element props contain everything required to make a DOM element behave correctly.

```ts
props.trigger
props.content
props.panel
props.option
```

Each element receives one object that contains:

* DOM attributes
* ARIA attributes
* IDs
* `data-*` attributes
* event handlers

The consumer should normally perform one spread per element.

```vue
<button v-bind="props.trigger">
  Toggle
</button>
```

No additional accessibility wiring should be required for behavior already owned by the library.

---

# 6. Typed APIs

Components that expose values use generics.

```ts
interface ListboxApi<TValue>
  extends ComponentApi<
    ListboxState<TValue>,
    ListboxActions<TValue>,
    ListboxElementProps<TValue>
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
const {
  value,
  setValue,
} = useControllableState({
  value: props.open,
  defaultValue: false,
  onChange: props.onOpenChange,
})
```

Rules:

* controlled/uncontrolled mode is determined at setup time
* mode must not switch at runtime
* setting the current value is a no-op
* callbacks are not fired for unchanged values
* generic `T` handles arbitrary state types

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

---

# 10. State conventions

State is:

* read-only
* reactive
* intended for rendering and inspection
* never directly mutated by consumers

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

## `useTypeahead`

Allows users to jump to matching items by typing.

Used by patterns such as:

```text
Listbox
Menu
Select
```

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

export type Key = typeof Keys[keyof typeof Keys]
```

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
const CollapsibleContextKey =
  Symbol('CollapsibleContext')
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

* child registration
* internal stores
* internal keys
* component-specific coordination
* hidden child-facing operations

Internal visibility is an architectural boundary, not a security mechanism.

---

# 18. Element props

Element props are the DOM contract between the API layer and the consumer.

Rules:

* one object per logical element
* DOM attributes and event handlers are merged
* ARIA attributes are included
* IDs are included
* `data-*` state is included
* no classes
* no styles
* no visual assumptions

Example:

```ts
interface CollapsibleElementProps {
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
<button v-bind="props.trigger">
  Toggle
</button>

<div
  v-if="state.isPresent"
  v-bind="props.content"
>
  Content
</div>
```

---

# 19. Dynamic element props

Static elements expose plain objects.

Dynamic child elements expose getter functions.

Convention:

```text
getXProps()
```

Example:

```ts
props.getOptionProps(value)
```

This allows per-item state and event handlers to be generated from the item's value.

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
<div
  v-if="state.isPresent"
  v-bind="props.content"
/>
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

Internal behavior runs first, followed by consumer behavior.

The library uses an internal utility:

```ts
composeEventHandlers(
  internal,
  external,
)
```

It is not part of the public API.

Vue's normal event binding behavior is relied upon where appropriate.

The library must never silently discard consumer handlers.

---

# 22. Accessibility architecture

Accessibility is part of the API layer, not an optional enhancement of the component layer.

The library owns behavioral accessibility.

## Library responsibility

The library manages:

* required roles
* ARIA relationships
* ARIA states
* generated IDs
* focus management
* keyboard interactions
* focus restoration
* focus trapping
* modal background hiding
* live announcements where applicable

## Consumer responsibility

The consumer provides semantic information specific to their content.

Examples:

* meaningful labels
* descriptions
* page landmarks
* application-specific accessible names

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
<div data-headless-portal>
```

The library does not own visual stacking order.

Z-index and visual presentation remain consumer concerns.

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
<div
  v-if="state.isPresent"
  v-bind="props.panel"
/>
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

| Utility                | Purpose                       | Public |
| ---------------------- | ----------------------------- | ------ |
| `useControllableState` | Controlled/uncontrolled state | Yes    |
| `useOpenState`         | Open/close state              | Yes    |
| `usePresence`          | Exit presence                 | Yes    |
| `useId`                | Stable IDs                    | Yes    |
| `useRegistry`          | Dynamic child registration    | Yes    |
| `useHighlight`         | Highlighted item state        | Yes    |
| `useScrollLock`        | Body scroll locking           | Yes    |
| `useOutsideClick`      | Outside interaction           | Yes    |
| `useEscape`            | Escape handling               | Yes    |
| `useFocusTrap`         | Focus trapping                | Yes    |
| `usePortal`            | Overlay portals               | Yes    |
| `useArrowNavigation`   | Flat-list navigation          | Yes    |
| `useRovingFocus`       | Roving tabindex               | Yes    |
| `useTypeahead`         | Typeahead navigation          | Yes    |
| `announce`             | Live announcements            | Yes    |
| `Keys`                 | Keyboard constants            | Yes    |
| `composeEventHandlers` | Internal event composition    | No     |

A utility must have a concrete use case before becoming part of the core.

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
export {
  useCollapsible,
}

export {
  provideCollapsibleContext,
  useCollapsibleContext,
}

export type {
  UseCollapsibleProps,
  CollapsibleApi,
  CollapsibleState,
  CollapsibleActions,
  CollapsibleElementProps,
}
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
<slot
  :state="state"
  :actions="actions"
  :props="props"
/>
```

No second state model is introduced for slots.

The same API remains the source of truth.

---

# 35. IDs

IDs are generated through the shared `useId` infrastructure.

IDs must be:

* stable
* unique
* deterministic within their instance
* compatible with the configured `idPrefix`

IDs are part of component state/API when consumers may need them for custom composition.

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

* ESM
* declaration files
* source maps
* declaration maps

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
public element props
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
Badge
Alert
Separator
VisuallyHidden
```

### Phase 2 — Single-state components ✓

```text
Collapsible
Switch
Checkbox
```

### Phase 3 — Compound components without overlays ✓

```text
Accordion
Tabs
RadioGroup
```

### Phase 4 — Overlays ✓

```text
Dialog
Popover
Tooltip
```

### Phase 5 — Menus

```text
DropdownMenu
ContextMenu
NavigationMenu
```

### Phase 6 — Complex form controls

```text
Listbox
Combobox
Select
```

### Phase 7 — Feedback

```text
Toast
Progress
```

### Phase 8 — Remaining form controls

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
DOM props
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

`state`, `actions` and `props` form the public API contract.

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