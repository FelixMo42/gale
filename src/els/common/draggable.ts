import { _ } from "../../html"

export function draggable(child: HTMLElement) {
    return _.div
        .with((el) => el.onmousedown = (e) => pickup(e, el))
        (child)
}

const drag : {
    maybeSelected?: HTMLElement,
    selected?: HTMLElement,
    start?: number
    rawStart?: number
} = {}

function pickup(e: MouseEvent, el: HTMLElement) {
    drag.maybeSelected = el
    drag.start = e.y - el.offsetTop
    drag.rawStart = e.y
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
        const items = []
        for (let i = 0; i < list.length; i++) {
            const el = list.item(i)
            const rect = el.getBoundingClientRect()
            const y = (drag.selected === el) ? e.clientY
                : rect.top + rect.height / 2
            items.push({ y, el })
        }

        drag.selected.parentElement.replaceChildren(
            ...items
                .sort((a, b) => a.y - b.y)
                .map(({ el }) => el)
        )

        offsetView(e)

        e.preventDefault()
    }
}

function putdown() {
    drag.selected.classList.remove("drag")
    drag.selected.style.top = undefined
    drag.selected = undefined
}
