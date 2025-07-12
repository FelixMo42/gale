
import { access, readdir } from "node:fs/promises"
import { createHash } from "node:crypto"

import { config } from "../config.ts"

export function range(length: number, start: number = 0) {
    return new Array(length).fill(0).map((_, i) => i + start)
}

export function fuzzy(query: string, target: string): boolean {
    let qi = 0
    for (let i = 0; i < target.length && qi < query.length; i++) {
        if (target[i].toLowerCase() === query[qi].toLowerCase()) {
            qi++
        }
    }
    return qi === query.length
}


export async function exists(path: string) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

export async function get_all_notes(dir: string = config.notes_dir): Promise<string[]> {
    const all = await readdir(dir, {
        recursive: true
    })

    return all
        .filter(file => !file.startsWith("."))
        .filter(file => file.endsWith(".md"))
        .map(file => file.replaceAll(".md", ""))
        .sort()
}

export function hash(input: string) {
    return createHash('sha256').update(input).digest('hex')
}