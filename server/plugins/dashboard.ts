import { readFile, writeFile } from "node:fs/promises";
import { _ } from "../lib/html.ts"
import { RedirectResponse, Request } from "../lib/router.ts";
import { exists } from "../lib/utils.ts";

const apis = new Map<string, Api>()

const yoga_habit       = create_habit_sheet("yoga")
const productive_habit = create_habit_sheet("productive")
const social_habit     = create_habit_sheet("social")

const click_exersize   = api(() => yoga_habit.toggle_today())
const click_productive = api(() => productive_habit.toggle_today())
const click_social     = api(() => social_habit.toggle_today())

_.dashboard = (_attrs, _children) => {
    return _.article({ class: "flex col" }, [
        _.div({ class: "flex" }),
        _.div({ class: "row" }, [
            _.a({ href: click_exersize, class: "center flex", style: "background-color: red; padding: 10px" }, [ yoga_habit.get_streak() ]),
            _.a({ href: click_productive, class: "center flex", style: "background-color: green; padding: 10px" }, [ productive_habit.get_streak() ]),
            _.a({ href: click_social, class: "center flex", style: "background-color: lightblue; padding: 10px" }, [ social_habit.get_streak() ]),
        ])
    ])
}

///

type Api = () => void

function api(cb: Api): string {
    const url = `/api/${apis.size}`
    apis.set(url, cb)
    return url
}

export function dashboard(r: Request) {
    if (apis.has(r.url)) {
        apis.get(r.url)!()
        return RedirectResponse("http://localhost:8042", 303)
    }
}

///

function create_habit_sheet(name: string) {
    const sheet = json_db<{
        streak: number,
        days: string[],
    }>(name, {
        days: [],
        streak: 0,
    })

    return {
        async toggle_today() {
            const data = await sheet.load()
            const date = new Date().toDateString()
            if (data.days.includes(date)) {
                data.days = data.days.filter(day => day != date)
            } else {
                data.days.push(date)
            }
            sheet.save()
        },
        async get_streak() {
            const data = await sheet.load()
            return data.days.length;
        }
    }
}

function json_db<T>(name: string, base: T) {
    const path = `.hidden/db/${name}.json`

    let data: T | undefined = undefined;

    return {
        async load(): Promise<T> {
            if (data) return data
            if (!await exists(path)) return base
            data = JSON.parse(await readFile(path, "utf-8")) as T
            return data
        },
        save(update=data) {
            writeFile(path, JSON.stringify(update))
        },
    }
}