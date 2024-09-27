import { Command, openCommandPallet, Popup } from "./els/commandPallet"
import { initQuillEditor } from "./els/textEditor"
import { _ } from "./html"

export default function main() {
    const quillCommands = initQuillEditor()
    registerKeybindings([
        ...baseCommands,
        ...quillCommands,
    ])
}

function registerKeybindings(commands: Command[]) {
    const bindings = {
        "p": () => openCommandPallet(commands)
    }

    window.onkeydown = (e: KeyboardEvent) => {
        if (e.key in bindings && e.metaKey) {
            // NOPE!
            e.preventDefault()
            e.stopPropagation()

            // Do our stuff instead
            bindings[e.key]()
        }
    }
}

const baseCommands = [
    {
        name: "Fullscreen",
        call: () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                document.body.requestFullscreen()
            }
        }
    }
]

