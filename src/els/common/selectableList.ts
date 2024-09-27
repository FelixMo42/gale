import { _ } from "../../html"

export function selectableList<T>(data: T[], view: (d: T) => HTMLElement) {
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