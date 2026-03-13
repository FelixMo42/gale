const pages = new Map<string, string>()

export function add_page(title: string, body: () => Promise<string> | string) {
    
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