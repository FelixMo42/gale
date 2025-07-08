import { readFile, writeFile, open } from "node:fs/promises"
import { Server } from "node:http"
import { join } from "node:path"

const port = 8043

const search_paths = [
    "",
    ".",
    "../journal",
    "../gale"
]

async function exists(path: string): Promise<boolean> {
    try {
        await open(path)
        return true
    } catch {
        return false
    }
}

async function get(path: string): Promise<string> {
    for (const root of search_paths) {
        if (await exists(join(root, path))) {
            return await readFile(join(root, path))
        }

        if (await exists(join(root, `${path}.md`))) {
            return await readFile(join(".", "editor.html"), "utf-8").then(f => f
                .replaceAll("{ title }", "title")
                .replaceAll("{ path }", `${path}.md`)
            )
        }    
    }

    throw new Error(`Can't find ${path}!`, { cause: 404 })
}

async function post(path: string, text: string) {
    for (const root of search_paths) {
        if (await exists(join(root, path))) {
            console.log("SET", join(root, path))
            return await writeFile(join(root, path), text)
        }
    }
}

function server() {
    const server = new Server((req, res) => {
        req.setEncoding('utf-8')

        let data = ""
        req.on("data", chunk => data += chunk)
        req.on("end", async () => {
            try {

                const type = (
                    req.url?.endsWith(".css") ? "text/css" :
                    req.url?.endsWith(".js") ? "text/javascript" :
                    "text/html"
                )
                
                res.writeHead(200, {
                    "Content-Type": type,
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                })

                if (req.method === "POST") {
                    await post(req.url!, data)
                    res.end()
                } else if (req.method === "GET") {
                    res.end(await get(req.url!))
                }
            } catch (e) {
                res.writeHead(e.cause ?? 500, {
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                })

                res.end(String(e))
            }
        })
    })

    server.listen(port)
}

function main() {
    server()
}

main()
