import { on } from "eventmonger"
import { v4 as uuidv4 } from "uuid"

import { State, StateUpdate, TodoItem, state, update } from "./state"

function addTodoItem(text: string) {
    // there must be text
    if (text.length === 0) return

    update((state) => state.todo.push({
        id: uuidv4(),
        text
    }))
}

function updateTodoItem(item: TodoItem, text: string) {
    if (text === "") {
        // remove the todo
        update(state => state.todo = state.todo.filter((({ id }) => id !== item.id)))
    } else {
        // update the text on the item
        update(_state => item.text = text)
    }
}

function TodoItemView({ item }: { item: TodoItem }) {
    return <div>
        <input type="checkbox" />
        <input
            type="text"
            class="item"
            value={item.text}
            onchange={(e) => updateTodoItem(item, e.target.value)}
        />
    </div>
}

function AddTodoItemButton() {
    return <input
        type="text"
        placeholder="+ add todo item"
        onchange={(e) => addTodoItem(e.target.value)}
    />
}

export default function main() {
    return <div class="todo">
        {state.todo.map(item => <TodoItemView item={item} />)}
        <AddTodoItemButton />
    </div>
}

// some messy stuff that has to be exported here for now, I can't wait to have a better system //

export function watchState(event: (state: State) => void) {
    on(StateUpdate, event)
}