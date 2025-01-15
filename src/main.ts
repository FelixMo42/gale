import TaskView, { Todo } from "./plugins/tasks"
import { _, col } from "./core/html"
import { nav } from "./core/navigation"
import { dyn } from "./core/update"

type Block = {
    kind: "text",
    text: string,
} | {
    kind: "todo",
    todos: Todo[]
}

type Document = {
    title: string,
    blocks: Block[]
}

export function Router() {
    return dyn(() => nav, () => _.div.c("stack")(...nav.map(Document)))
}

function parseDocument(path: string, text: string): Document {
    const title = path.slice(0, -3).replaceAll("_", " ")
    const blocks = [] as Block[]
    const lines = text
        .split("\n")

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("```")) {
            const end = getNextLine(i)
            const data = JSON.parse(lines.slice(i + 1, end).join("\n"))

            blocks.push({
                kind: "todo",
                todos: data
            })

            i = end + 1
        } else {
            blocks.push({
                kind: "text",
                text: lines[i]
            })
        }
    }

    function getNextLine(start: number) {
        for (let i = start + 1; i < lines.length; i++) {
            if (lines[i] === "```") {
                return i
            }
        }
    }

    return { title, blocks }
}

function Document(path: string) {
    const container = _.div.c("document")()

    fetch(path)
        .then(file => file.text())
        .then(text => DocumentView(parseDocument(path, text)))
        .then(view => container.replaceChildren(view))

    return container
}

function DocumentView(document: Document) {
    return col(
        _.h1(document.title),
        ...document.blocks.map((block) => {
            if (block.kind === "text") {
                return _.p(block.text)
            } else if (block.kind === "todo") {
                return TaskView(block.todos)
            }
        })
    )
}

export default async function main() {
    document.getElementById("main").replaceChildren(Router())
}
