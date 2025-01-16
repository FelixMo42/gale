import TaskView, { Todo } from "./plugins/tasks"
import { _, col } from "./core/html"
import { nav } from "./core/navigation"
import { dyn } from "./core/update"

type Block = {
    kind: "text",
    text: string,
} | {
    kind: "checkbox",
    text: string,
} | {
    kind: "list",
    text: string,
} | {
    kind: "todo",
    todos: Todo[]
}

type Document = {
    title: string,
    blocks: Block[]
}

const cache = new Map<string, Document>()

export function Router() {
    return dyn(() => nav, () => _.div.c("stack")(...nav.map(Document)))
}

function parseDocument(path: string, text: string): Document {
    const title = path.slice(0, -3).replaceAll("_", " ")
    const blocks = [] as Block[]
    const lines = text
        .split("\n")

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("- [")) {
            blocks.push({
                kind: "checkbox",
                text: lines[i].substring(6)
            })
        } else if (lines[i].trim().startsWith("-")) {
            blocks.push({
                kind: "list",
                text: lines[i].trim().substring(2)
            })
        } else if (lines[i].startsWith("```")) {
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
    if (cache.has(path)) {
        return _.div.c("document")(DocumentView(cache.get(path)))
    }

    const container = _.div.c("document")()

    fetch(path)
        .then(file => file.text())
        .then(text => parseDocument(path, text))
        .then(data => cache.set(path, data).get(path))
        .then(data => DocumentView(data))
        .then(view => container.replaceChildren(view))

    return container
}

function DocumentView(document: Document) {
    return col(
        _.h1(document.title),
        ...document.blocks.map((block) => {
            if (block.kind === "text") {
                return _.p(buildText(block.text))
            } else if (block.kind === "list") {
                    return _.ul(_.li(buildText(block.text)))
            } else if (block.kind === "todo") {
                return TaskView(block.todos)
            } else if (block.kind === "checkbox") {
                return _.div.c("line")(
                    _.input.withAttr("type", "checkbox")(
                        _.div()
                    ),
                    _.label(buildText(block.text))
                )
            }
        })
    )
}

function buildText(text: string) {
    if (text.startsWith("[")) {
        const matches = text.match(/\[(.*)\]\((.*)\)/)
        return _.a.withAttr("href", matches[2])(matches[1])
    } else {
        return text
    }
}

export default async function main() {
    document.getElementById("main").replaceChildren(Router())
}
