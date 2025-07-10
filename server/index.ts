import { opendir, readFile, writeFile } from "node:fs/promises"
import { join, extname } from "node:path"

import { RedirectResponse, Request, ResponseBuilder, router } from "./router.ts"
import { exists } from "./utils.ts"
import { _, PageResponse } from "./html.ts"

import { config } from "../config.ts"
import { calendar } from "./calendar.ts"

function main() {
    router([
        calendar,
        notes,
        file_server(config.notes_dir),
        file_server("./client"),
    ]).listen(8042)
}

main()

/***************/
/* FILE SERVER */
/***************/

function file_server(base: string) {
    return async (req: Request) => {
        if (!await exists(`${base}${req.url}`)) return

        if (req.method === "GET") {
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
                _.section({}, [
                    _.editor({ href: `${req.url}.md` })
                ])
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
