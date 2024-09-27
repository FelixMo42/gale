import Quill from "quill"
import { Command, Popup } from "../els/commandPallet"
import { Project } from "../types"

const toolbar = [
    { 'header': 2 },
    'bold',
    'italic',
    'underline',
    'strike',
    { 'align': 'center' },
    'clean'
]

export function initQuillEditor(project: Project) {
    const quill = new Quill("main", {
        modules: { toolbar: { container: toolbar} },
        theme: "bubble"
    })

    // load contents
    quill.setContents(JSON.parse(localStorage.getItem(`save/${project.name}`)))

    // auto save
    quill.on("text-change", (_delta) => {
        const data = quill.getContents()
        const save = JSON.stringify(data)
        localStorage.setItem(`save/${project.name}`, save)
    })

    return makeQuillCommands(quill)
}

function makeQuillCommands(quill: Quill): Command[] {
    return [
        {
            name: "Word Count",
            call: () => {
                Popup(`Word Count: ${quill.getText().split(/\s/).length}`)
            }
        }
    ]
}
