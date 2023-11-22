import { on } from "eventmonger"
import { v4 as uuidv4 } from "uuid"

import { State, StateUpdate, Todo, state, update } from "./state"

function addTodoItem(text: string) {
    // there must be text
    if (text.length === 0) return

    update((state) => state.todo.push({
        id: uuidv4(),
        type: "todo",
        text,
        checked: false
    }))
}

function updateTodoItemText(item: Todo, text: string) {
    if (text === "") {
        // remove the todo
        update(state => state.todo = state.todo.filter((({ id }) => id !== item.id)))
    } else {
        // update the text on the item
        update(_state => item.text = text)
    }
}

function updateTodoItemChecked(item: Todo, checked: boolean) {
    update(_state => item.checked = checked)
}

function reorderTodo(todo: Todo[]) {
    update(state => state.todo = todo)
}

const drag: { selected?: HTMLElement, start?: number } = {}

function pickup(e: MouseEvent, el: HTMLElement) {
    el.classList.add("drag")

    drag.start = e.y - el.offsetTop
    drag.selected = el

    offsetView(e)
}

function putdown() {
    // make sure we have something to putdown
    if (!drag.selected) return

    // clear out drag stuff
    drag.selected.classList.remove("drag")
    drag.selected === undefined

    // get new todo order
    const list = drag.selected.parentElement.children
    const order = []
    for (let i = 0; i < list.length; i++) {
        order.push(list.item(i).id)
    }

    // only update if the order has changed
    if (order.every((id, i) => state.todo[i].id === id)) {
        return
    }

    // reorder
    reorderTodo(order.map((id) => state.todo.find((item) => item.id === id)))
}

document.onmousemove = (e) => {
    if (drag.selected) {
        // if were not clicking it any more, put it down
        if (e.buttons !== 1) return

        // get the postion of each item
        const list = drag.selected.parentElement.children
        const items = []
        for (let i = 0; i < list.length; i++) {
            const el = list.item(i)
            const rect = el.getBoundingClientRect()
            const y =
                (drag.selected === el) ? e.clientY
                : rect.top + rect.height / 2

            items.push({ y, el })
        }

        // sort the items
        items.sort((a, b) => a.y - b.y)

        // reorder the children if the order has changed
        if (!items.every(({ el }, i) => el.id === state.todo[i].id)) {
            drag.selected.parentElement.replaceChildren(...items.map(({ el }) => el))
        }

        // make so that the element follows the mouse
        offsetView(e)
    }
}

function offsetView(e) {
    const y = e.clientY - drag.selected.offsetTop - drag.start
    const view = drag.selected.firstChild as HTMLElement
    view.style.top = `${y}px`
}

window.onmouseup = () => putdown()

function TodoItemView({ item }: { item: Todo }) {
    const el = <div id={item.id} onmousedown={(e) => pickup(e, el)}>
        <span>
            <input
                type="checkbox"
                checked={item.checked}
                onchange={(e) => updateTodoItemChecked(item, e.target.checked)}
            />
            <input
                type="text"
                class="item"
                value={item.text}
                onchange={(e) => updateTodoItemText(item, e.target.value)}
            />
        </span>
    </div>

    return el
}

function AddTodoItemButton() {
    return <input
        type="text"
        id="add-todo"
        placeholder="+ add todo item"
        onchange={(e) => addTodoItem(e.target.value)}
    />
}

function SaveButton() {
    return <button onclick={() => {
        navigator.clipboard.writeText(JSON.stringify(state))
    }}>export</button>
}

export default function main() {
    return <div class="todo">
        <SaveButton/>
        <div>
            {state.todo.map(item => <TodoItemView item={item} />)}
        </div>
        <AddTodoItemButton />
    </div>
}

// some messy stuff that has to be exported here for now, I can't wait to have a better system //

export function watchState(event: (state: State) => void) {
    on(StateUpdate, event)
}