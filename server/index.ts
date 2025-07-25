import { opendir, readFile, writeFile } from "node:fs/promises"
import { join, extname } from "node:path"
import { exec } from "node:child_process"

import { RedirectResponse, Request, ResponseBuilder, router } from "./lib/router.ts"
import { exists } from "./lib/utils.ts"
import { _, PageResponse } from "./lib/html.ts"
import { gauth } from "./lib/gauth.ts"

import { calendar } from "./plugins/calendar.ts"
import { agenda } from "./plugins/agenda.ts"
import { search } from "./plugins/search.ts"

import { config } from "../config.ts"

function main() {
    // run the router
    router([
        gauth,
        agenda,
        search,
        calendar,
        notes,
        file_server(config.notes_dir),
        file_server("./client"),
    ]).listen(8042)

    // run the action scheduler
    scheduler()
}

async function scheduler() {
    await until("4:00")

    console.log("Good morning!")

    exec("arlo --morning")

    await sleep(1 * 60 * 60 * 1000)

    scheduler()
}

function until(time: string) {
    console.log(`waiting until ${time}`)

    const [hour, mins] = time.split(":")
    const target = new Date()
    target.setHours(Number(hour))
    target.setMinutes(Number(mins))

    if (target.getTime() < Date.now()) {
        console.log("(tomorrow)")
        target.setDate(target.getDate() + 1)
    }

    return sleep(target.getTime() - Date.now())
}

function sleep(timeout: number) {
    return new Promise(res => {
        setTimeout(res, timeout)
    })
}

main()

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
            await writeFile(join(base, req.url!), req.body)
            return ResponseBuilder(200)
        }
    }
}

/*********/
/* NOTES */
/*********/

async function notes(req: Request) {
    const [note, query] = req.url.split("?")
    if (note?.includes(".")) return

    console.log(note, query)

    if (await exists(`${config.notes_dir}${note}.md`) || query?.includes("create")) {
        return PageResponse({ title: note! }, [
            _.aside({}, [ _.calendar_widget({}) ]),
            _.main({}, [
                _.editor({ href: `${note}.md` })
            ]),
            _.aside({}, []),
            _.search_modal({}),
        ])
    }

    const dir = await opendir(config.notes_dir)

    for await (const path of dir) {
        if (path.isDirectory()) {
            if (await exists(`${path.parentPath}/${path.name}${note}.md`)) {
                return RedirectResponse(`${path.name}${note}`)
            }
        }
    }
}
