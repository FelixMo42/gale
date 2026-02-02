import { Database } from "bun:sqlite";

export const api = new Map<string, (r: Request) => string>()
const db = new Database("db.sqlite", { create: true })

db.run(`
    CREATE TABLE IF NOT EXISTS variables (
        name TEXT PRIMARY KEY,
        value TEXT
    )
`)

export function cb(func: (r: Request) => string | number) {
    const uuid = crypto.randomUUID()
    api.set(uuid, (req) => String(func(req)))
    return `/api/${uuid}`
}

export function get<T>(name: string): T | undefined {
    const value = db
        .query("SELECT value FROM variables WHERE name = ?")
        .get(name) as { value: string }

    if (!value) return undefined

    return JSON.parse(value.value) as T
}

export function set<T>(name: string, value: T): T {
    db.run("INSERT OR REPLACE INTO variables (name, value) VALUES (?, ?)", [
        name, JSON.stringify(value)
    ])

    return value
}
