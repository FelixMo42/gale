import { file } from "bun"
import * as time from "./utils/time.ts"
import { CalendarWidget, ProjectsWidget, AgendaWidget, HabitWidget } from "./widgets.tsx"
import { api } from "./utils/api.ts"
import { search_results } from "./search.tsx"
import { param, template } from "./utils/misc.ts"
import { readdir } from "fs/promises"
import { page } from "./utils/page.tsx"
import { agenda_page } from "./pages/agenda_page.tsx"
import { feed_page } from "./pages/feed_page.tsx"

const FS_PATH = "/Users/felixmoses/Documents/journal/"

async function html(html: Promise<string> | string) {
    return new Response(await html, {
        headers: {
            "Content-Type": "text/html",
        }
    })
}

async function diary_page(req: Request) {
    return page("diary", <>
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
            <AgendaWidget date={time.get_date_from_request(req)} />
            <HabitWidget />
        </aside>
    </>)
}

function get_path(req: Request, prefix: string = "") {
    return new URL(req.url).pathname.slice(1 + prefix.length)
}

Bun.serve({
    port: 8042,
    routes: {
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
        "/agenda": req => html(agenda_page(req)),
        "/feed": req => html(feed_page(req)),
        "/diary/*": req => html(diary_page(req)),
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