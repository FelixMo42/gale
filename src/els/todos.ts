import { _ } from "../html";
import { Project } from "../types";
import { draggable } from "./common/draggable";

export default function initTodos(project: Project) {
    const todos = [
        {
            text: "Apply to jobs",
        },
        {
            text: "Write for 1 hour",
        },
        {
            text: "Make tacocat story",
        }
    ]

    document
        .querySelector("main")
        .replaceChildren(_.div.withClass("todos")(
            ...todos.map(todo =>  
                draggable(
                    _.div
                    .withClass("todo")
                    (
                        _.input.withAttr("type", "checkbox")(),
                        _.div(todo.text)
                    )
                )
            )
        ))

    return []
}
