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

### Shape

```ts
interface CollapsibleState {
  // ids — for ARIA wiring
  triggerId: string
  contentId: string

  // booleans — always isX
  isOpen: boolean
  isDisabled: boolean
}

interface ListboxState<TValue> {
  triggerId: string
  listboxId: string

  isOpen: boolean
  isDisabled: boolean
  isEmpty: boolean

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
- Static elements — plain object, spread once.
- Dynamic per-item elements — getter function prefixed with `get`.

### What goes inside each element props object

```ts
// aria attributes
'aria-expanded': boolean
'aria-controls': string
role: 'dialog'

// dom attributes
id: string
tabindex: '-1'

// event handlers — camelCase, on prefix
onClick: (event: MouseEvent) => void
onKeydown: (event: KeyboardEvent) => void
```

### Shape

```ts
interface CollapsibleElementProps {
  trigger: {
    id: string
    'aria-expanded': boolean
    'aria-controls': string
    onClick: (event: MouseEvent) => void
    onKeydown: (event: KeyboardEvent) => void
  }
  content: {
    id: string
    role: 'region'
    'aria-labelledby': string
  }
}

interface ListboxElementProps {
  trigger: {
    id: string
    'aria-haspopup': 'listbox'
    'aria-expanded': boolean
    'aria-controls': string
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
  // getter for dynamic per-item props
  getOptionProps: (value: unknown) => {
    id: string
    role: 'option'
    'aria-selected': boolean
    'aria-disabled': boolean
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

```vue
<button v-bind="props.trigger" @click="customHandler" />
```

Vue's `v-bind` + `@event` merge naturally when using the same event name —
both handlers run. Our `composeEventHandlers` utility handles the cases where
we need explicit composition internally:

```ts
// core/src/utils/composeEventHandlers.ts — internal, not exported

export function composeEventHandlers<E extends Event>(
  internal: (event: E) => void,
  external?: (event: E) => void,
) {
  return (event: E) => {
    internal(event)
    external?.(event)
  }
}
```

Used internally when building element props. Never exposed to the consumer.

---

## ARIA types

Shared ARIA types used across all element props interfaces.
Typed strictly — no raw strings for roles or states internally.

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
- Live regions — dynamic announcements for Toast, loading states.
- Focus management — where focus goes on open, where it returns on close.
- Keyboard interactions — every APG keyboard pattern implemented completely.

### Consumer is responsible for

- Meaningful labels — `aria-label` on triggers. The library cannot know the semantic context.
- Descriptions — `aria-describedby` pointing to their own content when needed.
- Landmark roles — `main`, `nav`, `aside` on their page structure.

### APG pattern mapping

Every component maps to exactly one APG pattern.

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

Every component has this checklist as a comment block at the top of its
composable file — serves as both documentation and implementation guide.

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

## Live regions

Singleton live region created once at plugin install. All dynamic announcements
go through it. Consumer never touches it directly.

```ts
announce('Item saved', 'polite')     // waits for user to finish
announce('Error occurred', 'assertive')  // interrupts immediately, errors only
```

---

## Context

### Rules

- Every compound component family gets exactly two functions.
- Context carries the full `XApi` object — nothing more, nothing less.
- `useXContext` always throws a descriptive error if called outside its provider.
- No safe mode / nullable variant.
- InjectionKey Symbol label is the context name — readable for DevTools.

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
// composable
export { useCollapsible }

// context
export { provideCollapsibleContext, useCollapsibleContext }

// types
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
<div v-if="state.isOpen" v-bind="props.content">Content</div>
```

### Pattern 2 — building custom compound components using core

Root component:

```ts
// MyCollapsible.vue
import { useCollapsible, provideCollapsibleContext } from '@lucentis/headless-ui/core'

const componentProps = defineProps<UseCollapsibleProps>()
const api = useCollapsible(componentProps)
provideCollapsibleContext(api)
```

Child component:

```ts
// MyCollapsibleTrigger.vue
import { useCollapsibleContext } from '@lucentis/headless-ui/core'

const { state, actions, props } = useCollapsibleContext()
```

### Pattern 3 — using shipped components

```vue
<Collapsible v-model:open="isOpen">
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>
```

### Pattern 4 — using shipped components with slot props

```vue
<Collapsible v-model:open="isOpen">
  <template #default="{ state, actions }">
    <Transition name="fade">
      <CollapsibleContent v-if="state.isOpen">
        Content
      </CollapsibleContent>
    </Transition>
  </template>
</Collapsible>
```

---

## Slot props

Slot props are the composable return re-exposed to the consumer's template.
The component calls the composable internally and passes the result through the slot.
Same `{ state, actions, props }` shape — nothing new invented.

```vue
<!-- inside Collapsible.vue -->
<slot :state="state" :actions="actions" :props="props" />
```

---

## Shared utilities

These live in `core/src/utils/`. Not all are public.

| Utility | Purpose | Public |
|---|---|---|
| `useId` | Stable unique ID generation | yes |
| `useScrollLock` | Body scroll locking with scrollbar compensation | yes |
| `useOutsideClick` | Pointer event detection outside a target element | yes |
| `useEscape` | Escape key handler with active guard | yes |
| `useFocusTrap` | Focus containment within an element | yes |
| `composeEventHandlers` | Merges internal and consumer event handlers | no |

---

## File structure per component family

```
core/src/
  collapsible/
    useCollapsible.ts        ← composable (public)
    CollapsibleContext.ts    ← provide/inject (public)
    types.ts                 ← all types for this family (public)
    useCollapsible.test.ts   ← colocated tests
    index.ts                 ← barrel, public exports only

components/src/
  collapsible/
    Collapsible.vue
    CollapsibleTrigger.vue
    CollapsibleContent.vue
    index.ts
```

---

## Testing conventions

- Tests are colocated next to the file they test.
- Composables that use lifecycle hooks must be tested inside a mounted component.
- `beforeEach` resets any DOM side effects between tests.
- Module-level state (like ID counters) cannot be reset — test relative behavior, not exact values.
- Test environment: `happy-dom`.