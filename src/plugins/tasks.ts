import { _, flex } from "../core/html"
import { goTo } from "../core/navigation"

export interface Todo {
    id: string
    link: string
    status: "todo" | "active" | "done" 
}

function todoBox(props: {
    label: string,
    color: string,
    data: Todo[],
    flex?: number,
}) {
    return _.div
        .c("box", props.color)
        .style({
            flex: props.flex ? String(props.flex): undefined,
            "display": "flex",
            "flex-direction": "column",
            "min-height": props.label == "Done" ? 0 : undefined
        })(
            _.label(props.label),
            _.div.style({
                "overflow": "scroll",
                "display": "flex",
                "flex-direction": "column",
            })(
                ...props.data.map((todo) => _.div
                    .c("row", "flex", "pad", "press")
                    .on("click", () => {
                        if (todo.link) {
                            goTo(todo.link)
                        }
                    })(
                    flex(todo.id),
                ))
            )
        )
}

export default function TaskView(todos: Todo[]) {
    return _.div.c("row").style({ height: 300 })(
        todoBox({
            label: "Todo",
            color: "red",
            data: todos.filter(todo => todo.status === "todo"),
            flex: 3,
        }),
        _.div.c("col").style({ flex: String(2) })(
            todoBox({
                label: "Today",
                color: "blue",
                data: todos.filter(todo => todo.status === "active")
            }),
            todoBox({
                label: "Done",
                color: "green",
                data: todos.filter(todo => todo.status === "done"),
            }),
        ),
    )
}
