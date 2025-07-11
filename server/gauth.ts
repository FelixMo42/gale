import { readFile, writeFile } from "node:fs/promises"

import { RedirectResponse, Request, ResponseBuilder } from "./router.ts"
import { exists, hash } from "./utils.ts"

import { config } from "../config.ts"

export async function gfetch<T>(path: string, params: { [key: string]: string } = {}): Promise<T> {
    const url = new URL(`https://www.googleapis.com${path}`)
    for (const [key, val] of Object.entries(params)) {
        url.searchParams.set(key, val)
    }

    const cache_file = `./.cache/${hash(url.toString())}`
    if (await exists(cache_file)) {
        const cache = JSON.parse(await readFile(cache_file, "utf-8"))
        if (!cache.expires || cache.expires > Date.now()) {
            return cache.data
        }
    }

    const response = await fetch(url.toString(), {
        headers: {
            "Authorization": `Bearer ${config.token.access_token}`
        }
    })

    if (!response.ok) {        
        throw new Error(await response.text())
    }

    const data = await response.json()

    const end_of_day = getEndOfDay().getTime()
    await writeFile(cache_file, JSON.stringify({
        expires: end_of_day > Date.now() ? 0 : end_of_day,
        url: url.toString(),
        data
    }))

    return data
}

export async function gauth(r: Request) {
    const redirect_uri = "http://localhost:8042/auth/callback"

    if (r.url === "/auth/login") {
        const auth_url = new URL(config.oauth.auth_uri)
        auth_url.searchParams.set("client_id", config.oauth.client_id)
        auth_url.searchParams.set("redirect_uri", redirect_uri)
        auth_url.searchParams.set("response_type", "code")
        auth_url.searchParams.set("scope", "https://www.googleapis.com/auth/calendar.readonly")
        auth_url.searchParams.set("access_type", "offline")
        auth_url.searchParams.set("prompt", "consent")

        return RedirectResponse(auth_url.toString())
    } else if (r.url.startsWith("/auth/callback?")) {
        const code = new URL("http://localhost:8042" + r.url).searchParams.get("code")

        if (!code) {
            throw new Error("No code!")
        }

        const tokenRes = await fetch(config.oauth.token_uri, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                code,
                client_id: config.oauth.client_id,
                client_secret: config.oauth.client_secret,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code"
            })
        })

        if (!tokenRes.ok) {
            throw new Error("Failed to get token")
        }

        const token = await tokenRes.json()

        console.log(token)

        return ResponseBuilder(200, { "Content-Type": "application/json" }, JSON.stringify(token))
    }
}

function getEndOfDay() {
    const now = new Date()
    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    )
}