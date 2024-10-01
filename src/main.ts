import { openCommandPallet } from "./els/commandPallet"
import { initQuillEditor } from "./els/textEditor"
import initTodos from "./els/todos"
import { _ } from "./html"
import { Project } from "./types"

const projects: Project[] = [
    {
        name: "Todo",
        type: "Todo",
    },
    {
        name: "Feyhaven",
        type: "Book",
    },
    {
        name: "Uninventing the Gun",
        type: "Book",
    }
]

const state = {
    openProject: {
        name: "UNINIT",
        commands: [
            {
                name: "UNINIT",
                call: () => {}
            }
        ]
    }
}

function openProject(project: Project) {
    state.openProject = {
        name: project.name,
        commands: 
            project.type === "Book" ? initQuillEditor(project) :
            project.type === "Todo" ? initTodos(project) :
                [ { name: "UNKNOWN TYPE!!", call: () => {} } ]
    }
}

function getCommands() {
    return [
        ...state.openProject.commands,
        ...baseCommands,
        ...projects.map((project) => ({
            name: `Project: ${project.name}`,
            call: () => openProject(project)
        })),
    ]
}

export default function main() {
    registerKeybindings()
    openProject(projects[0])
}

function registerKeybindings() {
    const bindings = {
        "p": () => openCommandPallet(getCommands())
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
                document.querySelector("#root").requestFullscreen()
            }
        }
    },
    {
        name: "Connect to Google",
        call: async () => {
            
        }
    }
]
