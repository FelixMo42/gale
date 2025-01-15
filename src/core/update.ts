import { _ } from "./html"

const hooks = new Set<Function>()

export function update() {
    hooks.forEach(hook => hook())
}

export function listen(hook: Function) {
    hooks.add(hook)
    return hook
}

export function use<T>(data: () => T, hook: (t: T) => void): void {
    const start = data()
    hook(start)

    let memory = JSON.stringify(start)

    listen(() => {
        const newData = data()
        const newText = JSON.stringify(newData)
        if (newText !== memory) {
            memory = newText
            hook(newData)
        }
    })
}

export function dyn<T>(data: () => T, view: (t: T) => HTMLElement) {
    const parent = _.div()
    use(data, (d) => parent.replaceChildren(view(d)))
    return parent
}
