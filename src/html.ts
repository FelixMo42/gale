// BASIC BUILDER //

export type Children = (string | number | Node)[]

type HTMLBuilder = ((...c: Children) => HTMLElement) & {
    with: (t: (e: HTMLElement) => void) => HTMLBuilder
    withId: (id: string) => HTMLBuilder
    withAttr: (name: string, value: string | boolean | number) => HTMLBuilder
    withClass: (...classes: string[]) => HTMLBuilder
    withStyle: (style: { [key: string]: string | number }) => HTMLBuilder
    on: (event: string, cb: (e: KeyboardEvent | MouseEvent | InputEvent) => void) => HTMLBuilder
}

export const _ : { [key: string]: HTMLBuilder } = new Proxy({}, {
    get(na, tag: string): HTMLBuilder {
        const el = document.createElement(tag)
        
        const builder = (...children: Children) => {
            el.replaceChildren(...children.map((child) => {
                if (typeof child === "number") {
                    return _.span(String(child))
                } else if (typeof child === "string" && tag !== "span") {
                    return _.span(child)
                } else {
                    return child
                }
            }))
            return el
        }

        builder.with = (t: (el: HTMLElement) => void) => {
            t(el)
            return builder
        }

        builder.withId = (id: string) => {
            el.id = id
            return builder
        }

        builder.withAttr = (name: string, value: string) => {
            // some attributes are only about weather they are there or now
            // for thoses we want to not have them if we get a falsy value
            if (name === "checked" && !value) {
                return builder
            }

            // otherwise just set the attribute
            el.setAttribute(name, value)
            return builder
        }

        builder.withClass = (...classes: string[]) => {
            el.classList.add(...classes)
            return builder
        }

        builder.withStyle = (style: { [key: string]: string | number }) => {
            for (const [key, val] of Object.entries(style)) {
                el.style.setProperty(key,
                    typeof val === "number" ? `${val}px`
                        : val
                )
            }

            return builder
        }

        builder.on = (event: string, cb: (e: any) => void) => {
            el.addEventListener(event, cb)
            return builder
        }

        return builder
    }
})

export function flex(...children: Children) {
    return _.div.withClass("flex")(...children)
}

export function col(...children: Children) {
    return _.div.withClass("col")(...children)
}

export function row(...children: Children) {
    return _.div.withClass("row")(...children)
}
