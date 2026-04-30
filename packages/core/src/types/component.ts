export interface ComponentApi<TState, TActions, TBindings> {
    state: TState
    actions: TActions
    bindings: TBindings
}