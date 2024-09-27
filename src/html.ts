// BASIC BUILDER //

export type Children = (string | Node)[]

type HTMLBuilder = ((...c: Children) => HTMLElement) & {
    with: (t: (e: HTMLElement) => void) => HTMLBuilder
    withId: (id: string) => HTMLBuilder
    withAttr: (name: string, value: string) => HTMLBuilder
    withClass: (...classes: string[]) => HTMLBuilder
    withStyle: (style: { [key: string]: string | number }) => HTMLBuilder
    on: (event: string, cb: (e: KeyboardEvent | MouseEvent) => void) => HTMLBuilder
}

export const _ : { [key: string]: HTMLBuilder } = new Proxy({}, {
    get(_, tag: string): HTMLBuilder {
        const el = document.createElement(tag)
        
        const builder = (...children: Children) => {
            el.replaceChildren(...children)
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
