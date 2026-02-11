import { readdir } from "fs/promises"

export async function get_all_notes(): Promise<string[]> {
    const all = await readdir("/Users/felixmoses/Documents/journal", {
        recursive: true
    })

    return all
        .filter(file => !file.startsWith("."))
        .filter(file => file.endsWith(".md"))
        .map(file => file.replaceAll(".md", ""))
        .sort()
}

function fuzzy(query: string, target: string): boolean {
    let qi = 0
    for (let i = 0; i < target.length && qi < query.length; i++) {
        if (target[i]!.toLowerCase() === query[qi]!.toLowerCase()) {
            qi++
        }
    }
    return qi === query.length
}

export async function search_results(q: string) {
    const files = (await get_all_notes()).filter((file) => fuzzy(q, file))

    return (<>
        {files.map((file) =>
            <a href={`/${file}`}>{file}</a>
        )}
    </>)
}
