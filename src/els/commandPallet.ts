import { _, Children } from "../html"
import { selectableList } from "./common/selectableList"

export interface Command {
    name: string,
    call: () => void,
}

function filterCommands(commands: Command[], q: string, ): Command[] {
    return commands.filter((c) => c.name.toUpperCase().includes(q.toUpperCase()))
}

export function openCommandPallet(commands: Command[]) {
    // create the command input
    const input = _.input
        .with(keybindings({
            "ArrowUp": () => listEl.selectPrev(),
            "ArrowDown": () => listEl.selectNext(),
            "Enter": () => listEl.getSelected().click(),
            "Escape": () => close(),
        }))
        .on("input", (e) => {
            const value = (e.target as HTMLInputElement).value
            listEl.update(filterCommands(commands, value))
        })() as HTMLInputElement

    // box for the commands
    const listEl = selectableList(commands, (command) =>
        _.div
            .withClass("command")
            .on("click", () => {
                close()
                command.call()
            })
            (command.name)
    )

    // Display the popup
    const close = Popup(input, listEl.el)

    // Make sure the input if the selected element
    input.focus()
}

/* UTILS */

export function Popup(...children: Children) {
    const overlay = _.div
        .withClass("overlay")
        .on("click", close)
        ( _.div
            .withClass("popup")
            .on("click", (e) => e.stopPropagation())
            (...children)
        )

    document
        .getElementById("root")   
        .append(overlay)

    function close() {
        document
            .getElementById("root")
            .removeChild(overlay)
    }

    return close
}

function keybindings(bindings: { [k: string]: () => void }) {
    return (el: HTMLElement) => {
        el.onkeydown = (e) => {
            if (e.key in bindings) {
                bindings[e.key]()
                e.preventDefault()
            }
        }
    } 
}
