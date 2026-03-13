import { file } from "bun"
import * as time from "./utils/time.ts"
import { CalendarWidget, ProjectsWidget } from "./widgets.tsx"
import { api } from "./utils/api.ts"
import { search_results } from "./search.tsx"
import { get_path, param, template } from "./utils/misc.ts"
import { readdir } from "fs/promises"
import { html, page, PAGES } from "./utils/page.tsx"

// load in pages
import "./pages/agenda_page.tsx"
import "./pages/feed_page.tsx"
import "./pages/diary_page.tsx"

const FS_PATH = "/Users/felixmoses/Documents/journal/"

Bun.serve({
    port: 8042,
    routes: {
        ...PAGES,
        "/": (req) => Response.redirect(`/diary/${time.format_date_file(new Date())}`),
        "/static/*": (req) => new Response(file(get_path(req))),
        "/fs/*": {
            GET: async (req) => {
                const path = get_path(req, "fs/")
                const f = file(FS_PATH + path)
                if (!await f.exists())
                    return new Response(template(path))
                return new Response(f)
            },
            POST: async (req) => {
                const f = file(FS_PATH + get_path(req, "fs/"))
                f.write(await req.text())
                return new Response("OK")
            }
        },
        "/api/search": (req) => html(search_results(param(req, "q")!))
    },
    async fetch(req) {
        const path = get_path(req) 
        if (path.startsWith("api/"))
            return html(api.get(path.split("/").at(-1)!)!(req))
        return html(page(req.url.split("/").at(-1)!, <>
            <aside>
                <CalendarWidget month={param(req, "m")} />
                <ProjectsWidget />
            </aside>
            <main>
                <div
                    class="editor"
                    data-file={`/fs/${get_path(req)}.md`}
                    contenteditable="true"
                ></div>
            </main>
            <aside>
                <article class="flex">
                    <label class="center">Linked Refrences</label>
                    <div>{await refs()}</div>
                </article>
            </aside>
        </>))
    }
})

async function refs() {
    const lines = await grep("gale")
    return lines.map(line => <div class="bb pad">{line}</div>)
}

async function grep(search: string) {
    const all = await readdir("/Users/felixmoses/Documents/journal", { recursive: true })

    const p = await Promise.all(all
        .filter(file => !file.startsWith("."))
        .filter(file => file.endsWith(".md"))
        .map(file => Bun.file(`/Users/felixmoses/Documents/journal/${file}`).text())
    )

    const refs = [] as string[]

    for (const f of p)
        refs.push(...f
            .split("\n")
            .filter(line => line.includes(search))
        )

    return refs
}
