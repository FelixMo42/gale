import * as time from "./time.ts"

export function param(req: Request, name: string) {
    return new URL(req.url).searchParams.get(name) ?? undefined
}

function get_title_from_path(path: string) {
    const timestamp = path.match(/\d\d\d\d-\d\d-\d\d/)![0]
    return time.format_date_title(new Date(timestamp))
}

export function template(path: string) {
    if (path.startsWith(".hidden/agenda/"))
        return `wake up\n---\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ngo to sleep\n---`
    if (path.startsWith("diary/"))
        return `# ${get_title_from_path(path)}\n\n`
    return ""
}

export async function read(path: string) {
    const file = open(path)
    if (await file.exists())
        return file.text()
    return template(path)
}

export function open(path: string) {
    const full = "/Users/felixmoses/Documents/journal" + path
    return Bun.file(full)
}

export function get_path(req: Request, prefix: string = "") {
    return new URL(req.url).pathname.slice(1 + prefix.length)
}