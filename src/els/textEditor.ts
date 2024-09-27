import Quill from "quill"
import { Command, Popup } from "./commandPallet"

const toolbar = [
    { 'header': 2 },
    'bold',
    'italic',
    'underline',
    'strike',
    { 'align': 'center' },
    'clean'
]

export function initQuillEditor() {
    const quill = new Quill("main", {
        modules: { toolbar: { container: toolbar} },
        theme: "bubble"
    })

    // load contents
    quill.setContents(JSON.parse(localStorage.getItem("save")))

    // auto save
    quill.on("text-change", (_delta) => {
        const data = quill.getContents()
        const save = JSON.stringify(data)
        localStorage.setItem("save", save)
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
