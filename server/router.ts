import { Buffer } from "node:buffer"
import { Server, ServerResponse, type OutgoingHttpHeaders } from "node:http"

export interface Request {
    url: string,
    method: string,
    body: string,
}

type ResponseBuilder = (request: ServerResponse) => void

export function router(layers: Array<(r: Request) => Promise<ResponseBuilder | undefined> | ResponseBuilder | undefined>) {
    return new Server((req, res) => {
        // right now we only accept text request
        req.setEncoding('utf-8')

        // get body
        let body = ""
        req.on("data", chunk => body += chunk)

        // respond to the request
        req.on("end", async () => {
            const response_builder = await handle_response({
                url: req.url!,
                method: req.method!,
                body,
            })

            response_builder(res)
        })
    })

    async function handle_response(request: Request) {
        try {
            for (const layer of layers) {
                const response_builder = await layer(request)
                if (response_builder) return response_builder
            }

            return ErrorResponse(404, `Can't find ${request.url}!`)
        } catch (e) {
            return ErrorResponse(500, String(e))
        }
    }
}

export function ResponseBuilder(status_code: number, headers?: OutgoingHttpHeaders, body?: string | Buffer): ResponseBuilder {
    return (res: ServerResponse) => {
        res.writeHead(status_code, headers)
        res.end(body)
    }
}

export function RedirectResponse(location:  string) {
    return ResponseBuilder(302, { location })
}

export function ErrorResponse(status_code: number, text: string) {
    return ResponseBuilder(status_code, { "Content-Type": "text/html" }, text)
}

