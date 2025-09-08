import { Request, ResponseBuilder } from "../lib/router.ts"
import { format_date_title } from "../lib/time.ts"

export function template(req: Request) {
    for (const [path, template] of Object.entries(templates)) {
        if (pat_match(path, req.url)) {
            return ResponseBuilder(200,
                { "Content-Type": "text/markdown" },
                template(req.url),
            )
        }
    }
}

function pat_match(pat: string, str: string) {
    const segs = pat.split("*")
    return (str.startsWith(segs[0]) && str.endsWith(segs[1]))
}

const templates = {

    "/.hidden/agenda/*.md": () =>
"wake up\n---\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ngo to sleep\n---",

    "/diary/*.md": (path: string) =>
`# ${get_title_from_path(path)}

tasks:

# Journal

`,

}

function get_title_from_path(path: string) {
    const timestamp = path.match(/\d\d\d\d-\d\d-\d\d/)![0]
    return format_date_title(new Date(timestamp))
}