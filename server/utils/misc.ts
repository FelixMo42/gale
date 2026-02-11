export function param(req: Request, name: string) {
    return new URL(req.url).searchParams.get(name) ?? undefined
}