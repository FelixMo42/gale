import { file } from "bun"

async function html(html: Promise<string> | string) {
    return new Response(await html, {
        headers: {
            "Content-Type": "text/html",
        }
    })
}

export function range(length: number, start: number = 0) {
    return new Array(length).fill(0).map((_, i) => i + start)
}

function CalendarWidget() {
    return <article>
        <label>
            <a>{"<"}</a>
            <div class="flex">Calendar</div>
            <a>{">"}</a>
        </label>
        {range(6).map(week => <div class="row">
            {range(7).map(day => <a class="day">{day}</a>)}
        </div>)}
    </article>
}

function Fileswidget() {
    return <article class="flex">
        <label>Files</label>
    </article>
}

export function format_date_file(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function AgendaWidget({ date = new Date() }) {
    const start_h = 8
    const end_h   = 24

    return <article class="flex col">
        <label>Agenda</label>
        <div class="flex col relative">
            <div
                class="editor agenda"
                contenteditable="true"
                href={`fs/.hidden/agenda/${format_date_file(date)}.md`}
            ></div>
            {range(end_h - start_h, start_h).map(hour =>
                <div class="flex row agenda-row">
                    <div class="agenda-time">{hour}</div>
                </div>
            )}
        </div>
    </article>
}

function StatusWidget() {
    return <article>
        <label>
            <div class="flex">Status</div>
        </label>
    </article>
}

async function page(req: Request) {
    return "<!DOCTYPE html>" + <html>
        <head>
            <title>{get_path(req)}</title>

            <meta charset="UTF-8" />

            <link rel="stylesheet" href="static/editor.css" />

            <script src="static/editor.js"></script>
            <script src="static/agenda.js"></script>
        </head>
        <body>
                <aside>
                    <CalendarWidget />
                    <Fileswidget />
                </aside>
                <main>
                    <div
                        class="editor"
                        href={`/fs/${get_path(req)}.md`}
                        contenteditable="true"
                    ></div>
                </main>
                <aside>
                    <AgendaWidget />
                    <StatusWidget />
                </aside>
        </body>
    </html>
}

function get_path(req: Request, prefix: string = "") {
    return new URL(req.url).pathname.slice(1 + prefix.length)
}

const FS_PATH = "/Users/felixmoses/Documents/journal/"

Bun.serve({
    port: 8042,
    routes: {
        "/static/*": (req) => new Response(file(get_path(req))),
        "/fs/*": {
            GET: (req) => {
                const f = file(FS_PATH + get_path(req, "fs/"))
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
        return html(page(request))
    }
})
