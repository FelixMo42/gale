import { _, Children } from "../html"

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
        })
        () as HTMLInputElement

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

function selectableList<T>(data: T[], view: (d: T) => HTMLElement) {
    const el = _.div(...data.map(view))

    let selected = 0

    el.children[selected].classList.add("selected")

    const self = {
        el,
        getSelected() {
            return el.children[selected] as HTMLElement
        },
        selectNext() {
            self.select(selected + 1)
        },
        selectPrev() {
            self.select(selected - 1)
        },
        select(n: number | ((n: number) => number)) {
            // deselect old command
            self.getSelected()?.classList.remove("selected")
            
            // if function, call it
            selected = typeof n === "function" ? n(selected) : n

            // wrap the number around
            selected %= el.children.length
            while (selected < 0) {
                selected += el.children.length
            }
    
            // select new command
            self.getSelected().classList.add("selected")
        },
        update(data: T[]) {
            el.replaceChildren(...data.map(view))
            self.select(0)
        }
    }

    return self
}

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
