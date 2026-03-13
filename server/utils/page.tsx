export const PAGES: {
    [key: string]: ((req: Request) => Promise<Response>)
} = {}

export async function html(html: Promise<string> | string) {
    return new Response(await html, {
        headers: {
            "Content-Type": "text/html",
        }
    })
}

export function add_page(title: string, body: (req: Request) => JSX.Element) {
    PAGES[title] = req => html(body(req))
}

export async function page(title: string, body: string | Promise<string>) {
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