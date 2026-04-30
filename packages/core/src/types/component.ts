export interface ComponentApi<TState, TActions, TBindings> {
    state: Readonly<TState>
    actions: TActions
    bindings: TBindings
}