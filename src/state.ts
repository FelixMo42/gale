import { Event, emit } from "eventmonger";

export interface TodoItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface State {
    todo: TodoItem[]
}

// internal state machinations //

export const StateUpdate = Event<State>()

export const state = get<State>("state", {
    todo: []
})

function get<T>(name: string, def: T): T {
    const data = localStorage.getItem(name) 

    if (data) {
        return JSON.parse(data)
    } else {
        return def
    }
}

export function update(updater: (state: State) => void) {
    updater(state)
    localStorage.setItem("state", JSON.stringify(state))
    emit(StateUpdate, state)
}