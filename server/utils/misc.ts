export function param(req: Request, name: string) {
    return new URL(req.url).searchParams.get(name) ?? undefined
}

export async function read(path: string) {
    const full = "/Users/felixmoses/Documents/journal" + path
    const file = Bun.file(full)
    if (await file.exists())
        return file.text()
    return ""
}