import { opendir, readFile, writeFile } from "node:fs/promises"
import { join, extname } from "node:path"

import { RedirectResponse, Request, ResponseBuilder, router } from "./router.ts"
import { exists, fuzzy, get_all_notes } from "./utils.ts"
import { _, PageResponse } from "./html.ts"

import { config } from "../config.ts"
import { calendar } from "./calendar.ts"

function main() {
    router([
        api,
        calendar,
        notes,
        file_server(config.notes_dir),
        file_server("./client"),
    ]).listen(8042)
}

main()

async function api(req: Request) {
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

/***************/
/* FILE SERVER */
/***************/

function file_server(base: string) {
    return async (req: Request) => {
        if (req.method === "GET") {
            if (!await exists(`${base}${req.url}`)) return
            
            const mime_types: { [key: string]: string } = {
                ".css"  : "text/css",
                ".js"   : "text/javascript",
                ".html" : "text/html",
                ".md"   : "text/markdown",
            }

            return ResponseBuilder(200,
                { "Content-Type": mime_types[extname(req.url!)] },
                await readFile(join(base, req.url!))
            )
        } else if (req.method === "POST") {
            console.log("SET", req.url)
            await writeFile(join(base, req.url!), req.body)
            return ResponseBuilder(200)
        }
    }
}

/*********/
/* NOTES */
/*********/

async function notes(req: Request) {
    if (req.url?.includes(".")) return

    if (await exists(`${config.notes_dir}${req.url}.md`)) {
        return PageResponse({ title: req.url! }, [
            _.aside({}, [ _.calendar_widget({}) ]),
            _.main({}, [
                _.editor({ href: `${req.url}.md` })
            ]),
            _.aside({}, []),
            _.popup({}, [
                _.input({ autofocus: "" }),
                _.div({ id: "results" })
            ])
        ])
    }

    const dir = await opendir(config.notes_dir)

    for await (const path of dir) {
        if (path.isDirectory()) {
            if (await exists(`${path.parentPath}/${path.name}${req.url}.md`)) {
                return RedirectResponse(`${path.name}${req.url}`)
            }
        }
    }
}
