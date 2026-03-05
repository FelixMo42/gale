import { read } from "./misc.ts"
import * as time from "./time.ts"

export async function getAgendaItems(date: Date) {
    const text = await read(`/.hidden/agenda/${time.format_date_file(date)}.md`)
    const events = [] as Event[]

    let event: Event | undefined = undefined

    for (const [i, line] of text.split("\n").entries()) {
        if (line == "") continue
        else if (line == "---") end_event(i + 1)
        else start_event(i, line)
    }

    return events

    function end_event(i: number) {
        if (!event) { return }
        event.time[1] = i / 2 + 8
        event.span = event.time[1] - event.time[0]
        events.push(event)
        event = undefined
    }

    function start_event(i: number, line: string) {
        end_event(i)
        event = {
            type: get_type(line.trim().toLowerCase()),
            name: line.trim(),
            time: [i / 2 + 8, -1],
            span: -1,
        }
    }
}

function get_type(name: string) {
    if (
        name.includes("writers block") ||
        name.includes("gale") ||
        name.startsWith("pp")
    ) return "PP"
    if (
        name.startsWith("lunch") ||
        name.startsWith("dinner") ||
        name.startsWith("wake up") ||
        name.startsWith("go to sleep") ||
        name.startsWith("train")
    ) return "life"
    if (
        name.includes("kate") ||
        name.includes("eli")
    ) return "Social"
    if (
        name.includes("ea42")
    ) return "EA42"
    if (
        name.includes("42")
    ) return "42"
    if (
        name.includes("meeting") ||
        name.includes("el")
    ) return "Entrelacs"
    if (
        name.includes("exercise")
    ) return "bod"
    if (
        name.includes("pc")
    ) return "pc"
    if (
        name.includes("aisc")
    ) return "aisc"
    return "misc"
}

interface Event {
    type: string
    name: string
    time: [number, number]
    span: number
}