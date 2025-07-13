import { _ } from "../lib/html.ts"
import { Request, ResponseBuilder } from "../lib/router.ts"
import { fuzzy, get_all_notes } from "../lib/utils.ts"

export async function search(req: Request) {
    if (req.url.startsWith("/api/search")) {
        const [_path, query] = req.url.split("?q=")

        const notes = await get_all_notes()

        const html = notes
            .map(note => note.replaceAll("_", " "))
            .filter(note => fuzzy(query, note))
            .map(note => {
                const parts = note
                    .split("/")
                    .map(p => `<span>${p}</span>`)

                return `<a href="/${note.replaceAll(" ", "_")}">${parts.join("")}</a>`
            })
            .join("")

        return ResponseBuilder(200, { "content-type": "text/html" }, html)
    }
}

_.search_modal = (_attrs, _children) => {
    return _.dialog({}, [
        _.input({ autofocus: "" }),
        _.div({ id: "results" })
    ])
}
