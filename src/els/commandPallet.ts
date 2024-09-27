import { _, Children } from "../html"

export interface Command {
    name: string,
    call: () => void,
}

export function openCommandPallet(commands: Command[]) {
    // create the command input
    const input = _.input() as HTMLInputElement
    const commandElsBox = _.div()

    // default selected command
    let selected = 0

    renderCommands("")

    // Display the popup
    const close = Popup(input, commandElsBox)

    // Make sure the input if the selected element
    input.focus()

    input.onkeydown = (e) => {
        // Go up one command
        if (e.key === "ArrowUp") {
            select(selected - 1)
            e.preventDefault()
        }

        // Go down one command
        if (e.key === "ArrowDown") {
            select(selected + 1)
            e.preventDefault()   
        }

        // Activate selected command
        if (e.key === "Enter") {
            e.preventDefault()
            const commandEl = commandElsBox.children[selected] as HTMLElement
            commandEl.click()
        }

        // Leave the command palet
        if (e.key === "Escape") {
            close()
            e.preventDefault()
        }
    }
    
    input.oninput = () => {
        renderCommands(input.value)
    }

    // render the commands
    function renderCommands(q: string) {
        commandElsBox.replaceChildren(
            ...commands
            .filter((command) => command.name.toUpperCase().includes(q.toUpperCase()))
            .map((command) =>
                _.div
                    .withClass("command")
                    .on("click", () => {
                        close()
                        command.call()
                    })
                    (command.name)
            )
        )

        // select first element
        select(0)
    }

    // select a command by number in list
    function select(n: number) {
        // deselect old command
        commandElsBox.children[selected]?.classList.remove("selected")
        
        // wrap
        selected = n % commands.length
        while (selected < 0) {
            selected += commands.length
        }

        // select new command
        commandElsBox.children[selected]?.classList.add("selected")
    }
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
