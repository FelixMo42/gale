
import { access } from "node:fs/promises"

export function range(length: number, start: number = 0) {
    return new Array(length).fill(0).map((_, i) => i + start)
}

export async function exists(path: string) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}
