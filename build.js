import * as esbuild from "esbuild"
import http from "http"
import fs from "fs/promises"

async function read(path) {
    const file = await fs.readFile(path)
    return file.toString()
}

async function serve(res, path) {
    res.setHeader("Content-Type", {
        "html": "text/html",
        "js": "text/javascript",
        "json": "text/json",
        "css": "text/css",
        "md": "text/markdown",
        "png": "image/png",
    }[path.split(".").splice(-1)[0]])

    res.end(await read(path))
}

async function server() {
    http.createServer(async (req, res) => {
        if (req.url === "/favicon.ico") {
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain')
            res.end('404 Not Found')
        } else if (req.url === "/") {
            await serve(res, "./pub/index.html")
        } else if (req.url.includes(".json")) {
            await serve(res, `./.cache${req.url}`)
        } else if (req.url.includes(".md")) {
            await serve(res, `./.cache${req.url}`)
        } else {
            await serve(res, `./pub${req.url}`)
        }
    }).listen(8001, "localhost")
}

export async function builder() {
    const ctx = await esbuild.context({
        entryPoints: [ "src/main.ts" ],
        outfile: "pub/index.js",
        platform: "browser",
        format: "esm",
        bundle: true,
        jsxFactory: 'm',
    })

    ctx.watch()
}

function main() {
    builder()
    server()
}

main()