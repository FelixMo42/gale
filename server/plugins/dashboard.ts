import { readFile, writeFile } from "node:fs/promises";
import { _ } from "../lib/html.ts"
import { RedirectResponse, Request } from "../lib/router.ts";
import { exists } from "../lib/utils.ts";
import { join } from "node:path";
import { config } from "../../config.ts";
import { format_date_file } from "../lib/time.ts";

const apis = new Map<string, Api>()

const yoga_habit       = create_habit_sheet("yoga")
const productive_habit = create_habit_sheet("productive")
const social_habit     = create_habit_sheet("social")

const click_exersize   = api(() => yoga_habit.toggle_today())
const click_productive = api(() => productive_habit.toggle_today())
const click_social     = api(() => social_habit.toggle_today())

interface Task {
    text: string,
    status: string,
}

async function get_tasks(date: Date) {
    const path = join(config.notes_dir, "diary", format_date_file(date) + ".md")
    const file = (await readFile(path, "utf8")).split("\n")

    const tasks = [] as Task[]

    for (let i = 1; i < file.length; i++) {
        if (file[i].startsWith("#")) break
        if (file[i].startsWith("_ ") ||
            file[i].startsWith("√ ") ||
            file[i].startsWith("~ ") ||
            file[i].startsWith("X ")
        ) tasks.push({
            text: file[i].substring(2).trim(),
            status: file[i][0]
        })
    }
    return tasks
}

function get_top_priority_task(tasks: Task[]) {
    return tasks.find(task => task.status == "_")?.text!
}

function ins(tasks: Task[], status: string) {
    return tasks.filter(task => status.includes(task.status))
}

function percent(n: number) {
    return Math.floor(n * 100)
}

_.dashboard = async (_attrs, _children) => {
    const tasks = await get_tasks(new Date())
    const done  = ins(tasks, "√X")

    return _.article({ class: "flex col" }, [
        _.div({ class: "flex pad" }, [
            _.b({}, [ "Top priority: " ]),
            get_top_priority_task(tasks)
        ]),
        _.div({ class: "flex pad" }, [
            _.b({}, [ "Percent: " ]),
            `${done.length}/${tasks.length} = ${percent(done.length/tasks.length)}%`
        ]),
        _.div({ class: "row" }, [
            _.a({ href: click_exersize, class: "center flex", style: "background: url(/.hidden/images/heart.jpg); background-size: cover; background-position: center; padding: 10px; color: black;" }, [ yoga_habit.get_streak() ]),
            _.a({ href: click_productive, class: "center flex", style: "background: url(/.hidden/images/garden.png); background-size: cover; background-position: center; padding: 10px; color: black;" }, [ productive_habit.get_streak() ]),
            _.a({ href: click_social, class: "center flex", style: "background: url(/.hidden/images/water.png); background-size: cover; background-position: center; padding: 10px; color: black;" }, [ social_habit.get_streak() ]),
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
        days: string[],
    }>(name, {
        days: [],
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
            await sheet.save()
        },
        async get_streak() {
            const data = await sheet.load()
            return data.days.length;
        }
    }
}

function json_db<T>(name: string, base: T) {
    const path = join(config.notes_dir, `.hidden/db/${name}.json`)

    let data: T | undefined = undefined;

    return {
        async load(): Promise<T> {
            if (data) return data
    
            if (!await exists(path)) {
                data = base
            } else {
                data = JSON.parse(await readFile(path, "utf-8")) as T
            }

            return data
        },
        async save(update=data) {
            console.log(update, data, JSON.stringify(update))
            await writeFile(path, JSON.stringify(update))
        },
    }
}