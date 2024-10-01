import { _ } from "../html";
import { Project } from "../types";
import { Popup } from "./commandPallet";
import { draggable } from "./common/draggable";

interface Todo {
    text: string,
    done?: boolean
}

function todoView(todo: Todo) {
    return draggable(
        _.div
        .withClass("todo")
        (
            _.input
                .withAttr("type", "checkbox")
                .withAttr("checked", todo.done)
                (),
            _.input
                .withAttr("type", "text")
                .withAttr("value", todo.text)
                ()
        )
    )
}

export default function initTodos(project: Project) {
    const todos: Todo[] = [
        {
            text: "test",
        }
    ]

    function render() {
        document
            .querySelector("main")
            .replaceChildren(_.div.withClass("todos")(
                ...todos.map(todoView)
            ))
    }

    render()

    return [
        {
            name: "Add Todo",
            call: () => askText("New Todo", (text) => {
                todos.push({ text })
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