import { file } from "bun";

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

            <link rel="stylesheet" href="static/editor.css" />

            <script src="static/editor.js"></script>
            <script src="static/agenda.js"></script>
        </head>
        <body>
                <div class="flex"></div>
                <div
                    class="editor"
                    href={`/fs/${get_path(req)}.md`}
                    contenteditable="true"
                ></div>
                <div class="flex"></div>
        </body>
    </html>
}

function get_path(req: Request, prefix: string = "") {
    return new URL(req.url).pathname.slice(1 + prefix.length)
}

const FS_PATH = "/Users/felixmoses/Documents/journal/"

Bun.serve({
    port: 8043,
    routes: {
        "/static/*": (req) => new Response(file(get_path(req))),
        "/fs/*": {
            GET: (req) => new Response(file(FS_PATH + get_path(req, "fs/"))),
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