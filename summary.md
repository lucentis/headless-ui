# @lucentis/headless-ui — Architecture Bible

---

## Package structure

```
@lucentis/headless-ui          → renderless components
@lucentis/headless-ui/core     → composables, context, types
```

Single published package, two entry points. Internal monorepo splits into
`packages/core` and `packages/components`. One dependency boundary: components
import from core, never the reverse.

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `Dialog.vue` |
| Composable files | camelCase, use prefix | `useDialog.ts` |
| Context files | PascalCase + Context suffix | `DialogContext.ts` |
| Test files | match source file | `useDialog.test.ts` |
| Barrel files | always lowercase | `index.ts` |
| Props interface | `UseXProps` | `UseDialogProps` |
| State interface | `XState` | `DialogState` |
| Actions interface | `XActions` | `DialogActions` |
| ElementProps interface | `XElementProps` | `DialogElementProps` |
| Api interface | `XApi` | `DialogApi` |

---

## Global config

Provided once via plugin at app level. Every composable reads it via `useConfig()`.
Per-instance props always override global config.

```ts
interface HeadlessUIConfig {
  portalTarget?: string | HTMLElement  // default: 'body'
  scrollLock?: 'padding' | 'margin' | 'none'  // default: 'padding'
  closeOnOutsideClick?: boolean  // default: true
  closeOnEscape?: boolean  // default: true
  animationDuration?: number  // default: 0
  dir?: 'ltr' | 'rtl'  // default: 'ltr'
  idPrefix?: string  // default: 'headless'
}
```

Plugin usage:

```ts
app.use(createHeadlessUI({ idPrefix: 'myapp' }))
```

Treeshaken usage — no plugin needed, defaults apply automatically.

---

## Base contract

Every composable return extends this base. No exceptions.

```ts
interface ComponentApi<TState, TActions, TElementProps> {
  state: Readonly<TState>
  actions: TActions
  props: TElementProps
}
```

`props` contains one object per element, each with both DOM attributes and
event handlers merged and ready to spread. The consumer always does one spread
per element, nothing more.

Components with typed values (Listbox, Combobox, Select) pass the value type
as a generic that flows through the entire api:

```ts
interface ListboxApi<TValue> extends ComponentApi<
  ListboxState<TValue>,
  ListboxActions<TValue>,
  ListboxElementProps
> {}
```

Simple components with no value type need no generic:

```ts
interface CollapsibleApi extends ComponentApi<
  CollapsibleState,
  CollapsibleActions,
  CollapsibleElementProps
> {}
```

---

## Props (composable input)

### Input shape

The composable always receives a single props object. Never multiple arguments.

```ts
const api = useCollapsible(props)           // correct
const api = useCollapsible(open, disabled)  // never
```

### MaybeRef

All controllable and behavioral props accept `MaybeRef<T>` so composable-only
users get full reactivity without wrapping in a component.

Vue 3.3+ `toValue` is used internally to unwrap — no custom utility needed.

```ts
import { toValue } from 'vue'
```

```ts
import type { MaybeRef } from 'vue'

interface UseCollapsibleProps {
  open?: MaybeRef<boolean>
  defaultOpen?: boolean
  onOpenChange?: (value: boolean) => void
  disabled?: MaybeRef<boolean>
}
```

### Controlled vs uncontrolled

Every component that has controllable state supports both modes.

| Prop | Purpose |
|---|---|
| `defaultX` | Initial value. Library owns state after mount. Uncontrolled. |
| `x` | Consumer owns state. Library emits but never mutates internally. Controlled. |
| `onXChange` | Callback that fires when x should change. |

Callback naming convention — always `on` + prop name in PascalCase + `Change`:

```ts
onOpenChange?: (value: boolean) => void
onValueChange?: (value: TValue) => void
onCheckedChange?: (value: boolean) => void
```

### What belongs in props vs config

- `disabled` — always a prop, never global. Varies per instance.
- `loop`, `orientation` — props. Vary per use on the same page.
- `closeOnEscape`, `closeOnOutsideClick` — config with per-instance prop override.

---

## State

### Rules

- Always readonly — consumer reads, never mutates directly.
- Always reactive — drives the template.
- IDs live in state, not element props — consumers need them for custom ARIA wiring outside the component tree.
- Booleans always use `isX` prefix.
- Every component with open/close behavior exposes both `isOpen` and `isPresent`.

### isPresent

`isPresent` stays true during exit animations, giving elements time to animate
out before unmounting. Driven by `animationDuration` in global config.

If `animationDuration` is 0 (default), `isPresent` mirrors `isOpen` exactly —
zero cost for consumers who do not animate.

```ts
// consumer uses isPresent for rendering, isOpen for animation state
```

```vue
<div
  v-if="state.isPresent"
  :data-state="state.isOpen ? 'open' : 'closed'"
  v-bind="props.panel"
>
  Content
</div>
```

### Shape

```ts
interface CollapsibleState {
  isOpen: boolean
  isPresent: boolean
  isDisabled: boolean
  triggerId: string
  contentId: string
}

interface ListboxState<TValue> {
  isOpen: boolean
  isPresent: boolean
  isDisabled: boolean
  isEmpty: boolean
  triggerId: string
  listboxId: string
  selectedValue: TValue | null
  activeValue: TValue | null
}
```

---

## Actions

### Rules

- Always void. Never return values.
- Consumer checks state before calling actions if they need to guard.
- Clean naming — no verb + noun verbosity.
- Typed via generics where values are involved.

### Shape

```ts
interface CollapsibleActions {
  open: () => void
  close: () => void
  toggle: () => void
}

interface ListboxActions<TValue> {
  open: () => void
  close: () => void
  toggle: () => void
  select: (value: TValue) => void
  deselect: (value: TValue) => void
  setActive: (value: TValue) => void
  clearActive: () => void
}
```

---

## Element props

### Rules

- One object per element, containing both DOM attributes and event handlers merged.
- Consumer does one spread per element — nothing more.
- No styles, no classes. All necessary DOM attributes allowed — ARIA, `id`, `tabindex`, `role`, `data-*`.
- `data-state` flows through element props automatically — never added manually by consumer.
- Static elements — plain object, spread once.
- Dynamic per-item elements — getter function prefixed with `get`.

### data-state values

| State | Value |
|---|---|
| Open | `open` |
| Closed | `closed` |
| Active | `active` |
| Inactive | `inactive` |
| Selected | `selected` |
| Checked | `checked` |
| Unchecked | `unchecked` |
| Disabled | `disabled` |
| Loading | `loading` |

### Shape

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

interface ListboxElementProps {
  trigger: {
    id: string
    'aria-haspopup': 'listbox'
    'aria-expanded': boolean
    'aria-controls': string
    'data-state': 'open' | 'closed'
    onClick: (event: MouseEvent) => void
    onKeydown: (event: KeyboardEvent) => void
  }
  listbox: {
    id: string
    role: 'listbox'
    'aria-labelledby': string
    tabindex: '-1'
    onKeydown: (event: KeyboardEvent) => void
  }
  getOptionProps: (value: unknown) => {
    id: string
    role: 'option'
    'aria-selected': boolean
    'aria-disabled': boolean
    'data-state': 'active' | 'inactive'
    onClick: (event: MouseEvent) => void
    onMouseenter: (event: MouseEvent) => void
  }
}
```

### Consumer usage

```vue
<!-- one spread per element, everything included -->
<button v-bind="props.trigger">Toggle</button>
<div v-bind="props.content">Content</div>

<!-- dynamic items -->
<li
  v-for="option in options"
  v-bind="props.getOptionProps(option.value)"
>
  {{ option.label }}
</li>
```

---

## Event merge strategy

When the consumer spreads our element props and adds their own handlers,
both must run. Internal handler fires first, consumer handler fires second.

Vue's `v-bind` + `@event` merge naturally — both handlers run.
`composeEventHandlers` is used internally for explicit composition:

```ts
// internal only, never exported
function composeEventHandlers<E extends Event>(
  internal: (event: E) => void,
  external?: (event: E) => void,
) {
  return (event: E) => {
    internal(event)
    external?.(event)
  }
}
```

---

## ARIA types

```ts
// core/src/types/aria.ts

type AriaRole =
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

type AriaHasPopup =
  | boolean
  | 'menu'
  | 'listbox'
  | 'tree'
  | 'grid'
  | 'dialog'

type AriaOrientation = 'horizontal' | 'vertical'
type AriaLive = 'off' | 'polite' | 'assertive'
```

---

## ARIA responsibility split

### Library is responsible for

- Roles — always set, never optional.
- Relationships — `aria-controls`, `aria-labelledby`, `aria-describedby`, `aria-activedescendant`. Always wired via the ID system.
- States — `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`. Always reactive, always in sync with component state.
- Live regions — dynamic announcements for Toast, loading states. `announce()` is public.
- Focus management — where focus goes on open, where it returns on close.
- Keyboard interactions — every APG keyboard pattern implemented completely.
- `aria-hidden` on background elements when a modal trap is active — handled automatically.

### Consumer is responsible for

- Meaningful labels — `aria-label` on triggers.
- Descriptions — `aria-describedby` pointing to their own content.
- Landmark roles — `main`, `nav`, `aside` on their page structure.

### APG pattern mapping

```
Collapsible      → APG Disclosure pattern
Dialog           → APG Dialog pattern
AlertDialog      → APG Alert Dialog pattern
Listbox          → APG Listbox pattern
Combobox         → APG Combobox pattern
Tabs             → APG Tabs pattern
Accordion        → APG Accordion pattern
DropdownMenu     → APG Menu Button pattern
Tooltip          → APG Tooltip pattern
Popover          → APG Dialog pattern (non-modal)
```

### Per-component ARIA checklist

Lives as a comment block at the top of every composable file.

```
ARIA checklist — [Component] ([APG pattern URL])

Roles
  [ ] role="X" on [element]

Relationships
  [ ] aria-controls on [element] pointing to [element]
  [ ] aria-labelledby on [element] pointing to [element]

States
  [ ] aria-expanded on [element] reflects isOpen
  [ ] aria-selected on [element] reflects isSelected
  [ ] aria-disabled on [element] reflects isDisabled

Focus
  [ ] focus moves to [element] on open
  [ ] focus returns to [trigger] on close
  [ ] focus is trapped inside when modal

Keyboard
  [ ] [Key] does [action]
```

---

## Keyboard navigation

### Keys constant

One place, all key values. Never raw strings in component code.

```ts
// core/src/utils/keyboard.ts — created when first needed

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

### Navigation utilities

Created when first needed by a component, not upfront.

| Utility | Pattern | Used by |
|---|---|---|
| `useArrowNavigation` | Moves through flat list | Listbox, Menu, Select |
| `useRovingFocus` | One tab stop in a group | Tabs, Toolbar, RadioGroup |
| `useTypeahead` | Jump to match by typing | Listbox, Menu, Select |

All three are public — consumers building custom compound components may need them.

### Which pattern to use

`useRovingFocus` — component is always visible, part of page flow. Tabs, RadioGroup.

`useArrowNavigation` — component opens on demand as overlay. Listbox, Menu.

### Event handling rules

```ts
case Keys.ArrowDown:
  event.preventDefault()  // always preventDefault on handled keys
  navigate('next')
  break
```

`stopPropagation` — never, unless there is a documented specific reason with a comment explaining why.

---

## Focus management

Three concerns, each handled separately.

### Initial focus

Priority order on open:

```
1. initialFocus prop if provided
2. first element with data-autofocus attribute
3. first focusable element in the container
4. the container itself via tabindex="-1"
```

Both `initialFocus` prop and `data-autofocus` are supported — they solve different situations.

### Return focus

Captured at open, restored at close with a guard for removed elements.

```ts
target.focus({ preventScroll: true })
```

`preventScroll: true` prevents page jumping to the trigger on close.

### Focus trap

Tab and Shift+Tab cycle only within the container when trap is active.
`aria-hidden="true"` applied automatically to all `body` children except the portal container when trap is active.

```ts
interface UseFocusTrapOptions {
  container: Ref<HTMLElement | null>
  active: Ref<boolean>
  trap?: Ref<boolean>  // default true for Dialog, false for Popover
}
```

`useFocusTrap` is public.

---

## Portal

### Rules

- Per-instance containers — each overlay creates and owns its container.
- Container marked with `data-headless-portal` — used by focus trap aria-hidden logic.
- z-index owned entirely by consumer via CSS targeting `data-headless-portal`.
- `usePortal` is public.

### Target resolution

```ts
interface UsePortalOptions {
  target?: MaybeRef<string | HTMLElement | null>
  // null uses global config portalTarget
}
```

### DOM output

```html
<body>
  <div id="app">...</div>
  <div data-headless-portal><!-- Dialog --></div>
  <div data-headless-portal><!-- Tooltip --></div>
</body>
```

---

## Animation

Zero shipped animation. Two mechanisms exposed.

### data-state

Flows through element props automatically. Consumer targets via CSS.

```css
[data-state="open"] { animation: fadeIn 150ms ease; }
[data-state="closed"] { animation: fadeOut 150ms ease; }
```

### isPresent

Stays true during exit animation window. Driven by `animationDuration` config.
Default 0 — no cost for consumers who do not animate.

```vue
<div
  v-if="state.isPresent"
  :data-state="state.isOpen ? 'open' : 'closed'"
  v-bind="props.panel"
/>
```

---

## Context

### Rules

- Every compound component family gets exactly two functions.
- Context carries the full `XApi` — nothing more, nothing less.
- `useXContext` always throws if called outside its provider.
- No nullable variant.
- Symbol label is the context name — readable for DevTools.

### Shape

```ts
const CollapsibleContextKey: InjectionKey<CollapsibleApi> = Symbol('CollapsibleContext')

export function provideCollapsibleContext(api: CollapsibleApi): void {
  provide(CollapsibleContextKey, api)
}

export function useCollapsibleContext(): CollapsibleApi {
  const context = inject(CollapsibleContextKey)
  if (!context) {
    throw new Error('[headless-ui] useCollapsibleContext must be used within a Collapsible')
  }
  return context
}
```

---

## Public exports per component family

```ts
export { useCollapsible }
export { provideCollapsibleContext, useCollapsibleContext }
export type {
  UseCollapsibleProps,
  CollapsibleApi,
  CollapsibleState,
  CollapsibleActions,
  CollapsibleElementProps,
}
```

---

## Consumer usage patterns

### Pattern 1 — composable only

```ts
const { state, actions, props } = useCollapsible({
  defaultOpen: false,
  onOpenChange: (val) => console.log(val),
})
```

```vue
<button v-bind="props.trigger">Toggle</button>
<div v-if="state.isPresent" v-bind="props.content">Content</div>
```

### Pattern 2 — custom compound components using core

```ts
// MyCollapsible.vue
const componentProps = defineProps<UseCollapsibleProps>()
const api = useCollapsible(componentProps)
provideCollapsibleContext(api)
```

```ts
// MyCollapsibleTrigger.vue
const { state, actions, props } = useCollapsibleContext()
```

### Pattern 3 — shipped components

```vue
<Collapsible v-model:open="isOpen">
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>
```

### Pattern 4 — shipped components with slot props

```vue
<Collapsible v-model:open="isOpen">
  <template #default="{ state }">
    <Transition name="fade">
      <CollapsibleContent v-if="state.isOpen">Content</CollapsibleContent>
    </Transition>
  </template>
</Collapsible>
```

---

## Slot props

Same `{ state, actions, props }` shape as the composable return. Nothing new.

```vue
<slot :state="state" :actions="actions" :props="props" />
```

---

## Utilities

Utilities are created when a component first needs them — not upfront.
Each utility has a concrete use case driving its design.

| Utility | Created when | Public |
|---|---|---|
| `useId` | First component needing stable IDs | yes |
| `useScrollLock` | Dialog | yes |
| `useOutsideClick` | Dialog, Popover | yes |
| `useEscape` | Dialog, Popover, Tooltip | yes |
| `useFocusTrap` | Dialog | yes |
| `usePortal` | Dialog | yes |
| `useArrowNavigation` | Listbox | yes |
| `useRovingFocus` | Tabs | yes |
| `useTypeahead` | Listbox | yes |
| `composeEventHandlers` | First component needing handler merge | no |
| `announce` | Toast | yes |
| `Keys` | First component needing keyboard handling | yes |

---

## Build output

- ESM only. No CJS.
- No minification — consumer's bundler handles it.
- Source maps and declaration maps enabled.
- Only `dist` published.
- Vue always external.
- Semver strictly — any change to `ComponentApi` base is a major version bump.

---

## Build order

### Phase 1 — stateless primitives
`Button`, `Badge`, `Alert`, `Separator`, `VisuallyHidden`

Validates the base contract with minimal complexity.

### Phase 2 — single state components
`Collapsible`, `Switch`, `Checkbox`

Controlled/uncontrolled pattern. No children communication.

### Phase 3 — compound components, no overlay
`Accordion`, `Tabs`, `RadioGroup`

Context pattern. Multiple children. No portal or focus trap.

### Phase 4 — overlays
`Dialog`, `AlertDialog`, `Popover`, `Tooltip`

Full stack — portal, focus trap, scroll lock, outside click, escape.

### Phase 5 — menus
`DropdownMenu`, `ContextMenu`, `NavigationMenu`

### Phase 6 — complex form controls
`Listbox`, `Combobox`, `Select`

### Phase 7 — feedback
`Toast`, `Progress`

### Phase 8 — remaining form controls
`Input`, `Textarea`, `NumberInput`, `DatePicker`

---

## Testing conventions

- Tests colocated next to the file they test.
- Composables using lifecycle hooks tested inside a mounted component.
- `beforeEach` resets DOM side effects between tests.
- Module-level state cannot be reset — test relative behavior, not exact values.
- Test environment: `happy-dom`.