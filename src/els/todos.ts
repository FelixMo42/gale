import { listen } from "../events";
import { _ } from "../html";
import { Project } from "../types";
import { Popup } from "./commandPallet";
import { draggableList } from "./common/draggable";

interface Todo {
    id: string,
    text: string,
    done?: boolean
}

function todoView(todo: Todo, onchange: () => void) {
    const checkbox = _.input
        .withAttr("type", "checkbox")
        .withAttr("checked", todo.done)
        .on("change", () => {
            todo.done = checkbox.checked
            onchange()
        })() as HTMLInputElement

    const text = _.input
        .withAttr("type", "text")
        .withAttr("value", todo.text)
        .on("input", () => {
            todo.text = text.value
            onchange()
        })() as HTMLInputElement

    return _.div.withClass("todo")(checkbox, text)
}

export default function initTodos(project: Project) {
    const savePath = `todo/${project.name}`
    const todos: Todo[] = JSON.parse(localStorage.getItem(savePath)) || []

    // when the array changes, save it
    // we have to use to events lib to hook into changes caused by draggable
    const onchange = () => localStorage.setItem(savePath, JSON.stringify(todos))
    listen(todos, onchange)

    function render() {
        document
            .querySelector("main")
            .replaceChildren(_.div.withClass("todos")(
                ...draggableList(todos, (todo) => todoView(todo, onchange))
            ))
    }

    render()


    return [
        {
            name: "Add Todo",
            call: () => askText("New Todo", (text) => {
                // add the item with a new unique id
                todos.push({
                    id: Date.now().toString(),
                    text
                })

                // tell the world we have added a new todo item
                onchange()
                render()
            })
        }
    ]
}

async function askText(name: string, cb: (t: string) => void) {
    const input = _.input.on("keydown", (e: KeyboardEvent) => {            
        if (e.key === "Enter") {
            exit()
            cb(input.value)
        }
    })() as HTMLInputElement

    const exit = Popup(_.label(name), input)

    input.select()
}
