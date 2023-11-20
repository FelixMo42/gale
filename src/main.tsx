import { on } from "eventmonger"

import { State, StateUpdate } from "./state"

export default function main() {
    return <div>hello world</div>
}

// some messy stuff that has to be exported here for now, I can't wait to have a better system //

export function watchState(event: (state: State) => void) {
    on(StateUpdate, event)
}