import { ResponseBuilder } from "./router.ts"

interface PageAttrs {
    title: string,
}

export async function PageResponse({ title }: PageAttrs, children: TagChildren) {
    return ResponseBuilder(200, { "Content-Type": "text/html" }, `
        <!DOCTYPE html>
        <html>

        <head>
            <title>${title}</title>

            <meta charset="UTF-8">
            
            <link rel="stylesheet" href="/editor.css">

            <script src="/editor.js"></script>
            <script src="/agenda.js"></script>
        </head>

        <body>${(await Promise.all(children)).join("")}</body>

        </html>
    `.replaceAll("    ", ""))
}

type TagAttrs    = { [key: string]: object | string | number | boolean }
type TagChildren = (string | number | Promise<string>)[]
type TagBuilder  = (attrs: TagAttrs, children?: TagChildren) => Promise<string> | string

export const _ = new Proxy({} as { [key: string]: TagBuilder }, {
    get(tags, tag_name: string) {
        return async (attrs: TagAttrs, children: TagChildren = []) => {
            if (tag_name in tags) {
                return tags[tag_name](attrs, children)
            }

            const tag = [tag_name, ...Object.entries(attrs).map(([key, val]) => {
                if (typeof val === "string") {
                    return `${key}="${val}"`
                } else {
                    return `${key}=${val}`
                }
            })].join(" ")

            const innerHtml = await Promise.all(children)
            return `<${tag}>${innerHtml.join("")}</${tag_name}>`
        }
    },

    set(tags, tag_name: string, tab_builder: TagBuilder) {
        tags[tag_name] = tab_builder
        return true
    }
})

_.editor = (attrs, children) => {
    return _.article({
        contenteditable: true,
        class: "editor",
        ...attrs
    }, children)
}
