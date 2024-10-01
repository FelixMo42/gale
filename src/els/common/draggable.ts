import { emitUpdate } from "../../events"
import { _ } from "../../html"

interface HasID {
    id: string
}

export function draggableList<T extends HasID>(data: T[], view: (t: T) => HTMLElement) {
    return data.map(item => {
        const el = _.div
            .withId(item.id)
            .on("mousedown", (e: MouseEvent) => pickup(e, el, data))
            (view(item))

        return el
    })
}

const drag : {
    maybeSelected?: HTMLElement,
    selected?: HTMLElement,
    start?: number
    rawStart?: number
    data?: HasID[]
} = {}

function pickup(e: MouseEvent, el: HTMLElement, data: HasID[]) {
    drag.maybeSelected = el
    drag.start = e.y - el.offsetTop
    drag.rawStart = e.y
    drag.data = data
}

function offsetView(e: MouseEvent) {
    const y = e.clientY - drag.selected.offsetTop - drag.start
    const view = drag.selected.firstChild as HTMLElement
    view.style.top = `${y}px`
}

document.onmouseup = (e: MouseEvent) => {
    if (drag.selected) {
        putdown()
    }

    if (drag.maybeSelected) {
        drag.maybeSelected === undefined
    }
}

document.onmousemove = (e: MouseEvent) => {
    if (drag.maybeSelected) {
        if (e.buttons !== 1) {
            drag.maybeSelected === undefined
        }

        if (Math.abs(drag.rawStart - e.y) > 10) {
            drag.selected = drag.maybeSelected
            drag.selected.classList.add("drag")
            drag.maybeSelected = undefined
        }
    }

    if (drag.selected) {
        // If were not clicking any more, but it down
        if (e.buttons !== 1) return putdown()

        // Get the position of each child
        const list = drag.selected.parentElement.children
        
        // Keep track of the info for each element
        const id2y = new Map<string, number>()
        const id2el = new Map<string, Element>()

        // For each item, calculate where it is 
        for (let i = 0; i < list.length; i++) {
            const el = list.item(i)
            const rect = el.getBoundingClientRect()
            const y = (drag.selected === el) ? e.clientY
                : rect.top + rect.height / 2
            
            id2y.set(el.id, y)
            id2el.set(el.id, el)
        }

        let isOutOfOrder = false
        for (let i = 1; i < drag.data.length; i++) {
            if (id2y.get(drag.data[i - 1].id) > id2y.get(drag.data[i].id)) {
                isOutOfOrder = true
                break
            }
        }

        if (isOutOfOrder) {
            console.log("OUT OF ORDER!")

            // Sort into the new order
            drag.data.sort((a, b) => id2y.get(a.id) - id2y.get(b.id))

            // Update the view of the list to reflect the new order
            drag.selected.parentElement.replaceChildren(...drag.data.map(({ id }) => id2el.get(id)))

            // Tell the world our array has changed
            emitUpdate(drag.data)
        }

        // Offset the item we are currently holding
        offsetView(e)

        // Make sure nothing else happens
        e.preventDefault()        
    }
}

function putdown() {
    drag.selected.classList.remove("drag")
    drag.selected.style.top = undefined
    drag.selected = undefined
}
