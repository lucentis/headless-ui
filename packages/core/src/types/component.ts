export interface ComponentApi<TState, TActions, TElementProps> {
    state: Readonly<TState>
    actions: TActions
    props: TElementProps
}