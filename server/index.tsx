import { file } from "bun"
import * as time from "./utils/time.ts"
import { CalendarWidget, InboxWidget, AgendaWidget, StatusWidget } from "./widgets.tsx"
import { api, get } from "./utils/api.ts"

async function html(html: Promise<string> | string) {
    return new Response(await html, {
        headers: {
            "Content-Type": "text/html",
        }
    })
}

async function page(req: Request) {
    return "<!DOCTYPE html>" + <html>
        <head>
            <title>{get_path(req)}</title>

            <meta charset="UTF-8" />

            <link rel="stylesheet" href="/static/editor.css" />

            <script src="/static/editor.js"></script>
            <script src="/static/agenda.js"></script>
            <script src="/static/htmx.min.js"></script>
        </head>
        <body>
                <aside>
                    <CalendarWidget />
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
                    <StatusWidget />
                </aside>
        </body>
    </html>
}

function get_date_from_request(req: Request) {
    return new Date(req.url.match(/\d\d\d\d-\d\d-\d\d/)![0])
}

function get_path(req: Request, prefix: string = "") {
    return new URL(req.url).pathname.slice(1 + prefix.length)
}

const FS_PATH = "/Users/felixmoses/Documents/journal/"

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

Bun.serve({
    port: 8042,
    routes: {
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
                const body = await req.text()
                Bun.write(FS_PATH + get_path(req, "fs/"), body)
                return new Response("OK")
            }
        },
    },
    fetch(request) {
        const path = get_path(request) 
        if (path.startsWith("api/"))
            return html(api.get(path.split("/").at(-1)!)!(request))
        return html(page(request))
    }
})
