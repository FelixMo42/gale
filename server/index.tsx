import { file } from "bun"
import * as time from "./utils/time.ts"
import { CalendarWidget, InboxWidget, AgendaWidget, HabitWidget } from "./widgets.tsx"
import { api } from "./utils/api.ts"
import { search_results } from "./search.tsx"
import type { Message } from "@beeper/desktop-api/resources"
import { param } from "./utils/misc.ts"

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
            <InboxWidget />
        </aside>
        <main>
            <div
                class="editor"
                href={`/fs/${get_path(req)}.md`}
                contenteditable="true"
            ></div>
        </main>
        <aside>
            <AgendaWidget date={get_date_from_request(req)} />
            <HabitWidget />
        </aside>
    </>)
}

async function page(title: string, body: string | Promise<string>) {
    return "<!DOCTYPE html>" + <html>
        <head>
            <title>{title}</title>

            <meta charset="UTF-8" />

            <link rel="stylesheet" href="/static/editor.css" />

            <script src="/static/editor.js"></script>
            <script src="/static/agenda.js"></script>
            <script src="/static/modal.js"></script>
            <script src="/static/htmx.min.js"></script>
        </head>
        <body>{await body}</body>
        <dialog>
            <input></input>
            <div id="results"></div>
        </dialog>
    </html>
}

function get_date_from_request(req: Request) {
    return new Date(req.url.match(/\d\d\d\d-\d\d-\d\d/)![0])
}

function get_path(req: Request, prefix: string = "") {
    return new URL(req.url).pathname.slice(1 + prefix.length)
}

function get_title_from_path(path: string) {
    const timestamp = path.match(/\d\d\d\d-\d\d-\d\d/)![0]
    return time.format_date_title(new Date(timestamp))
}

function template(path: string) {
    if (path.startsWith(".hidden/agenda/"))
        return `wake up\n---\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ngo to sleep\n---`
    if (path.startsWith("diary/"))
        return `# ${get_title_from_path(path)}\n\n`
    return ""
}

async function MessageView({ message }: { message: Message }) {
    if (!message.text) return <></>

    if (message.isSender) return <div
        class="pad"
        style={{
            padding: "5px",
            backgroundColor: "lightblue",
            maxWidth: "100%",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
        }}
    >{message.text}</div>

    return <div
        class="pad"
        style={{
            padding: "5px",
            maxWidth: "100%",
            wordWrap: "break-word",
            backgroundColor: "#EEE",
            whiteSpace: "pre-wrap",
        }}
    >{message.text}</div>
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
        "/diary/*": req => html(diary_page(req)),
        "/api/search": (req) => html(search_results(param(req, "q")!))
    },
    fetch(request) {
        const path = get_path(request) 
        if (path.startsWith("api/"))
            return html(api.get(path.split("/").at(-1)!)!(request))
        return html(page(request.url.split("/").at(-1)!, <>
            <aside></aside>
            <main>
                <div
                    class="editor"
                    href={`/fs/${get_path(request)}.md`}
                    contenteditable="true"
                ></div>
            </main>
            <aside></aside>
        </>))
    }
})
