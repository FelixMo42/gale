import { readFile } from "node:fs/promises"

import { gfetch } from "./gauth.ts"
import { _ } from "./html.ts"
import { exists, range } from "./utils.ts"

import { config } from "../config.ts"

interface Event {
    name: string,
    start?: Date,
    end?: Date,
    color?: string,
}

export async function get_todays_events(date=new Date()): Promise<Event[]> {
    const gevent = (await get_events(date).catch(() => [])).filter(event => !!event.start)

    return [
        ...config.events,
        ...gevent,
    ].sort((a, b) => a.start!.getTime() - b.start!.getTime())
}

export async function get_events(date=new Date()) {
    const { time_min, time_max } = get_date_range(date)

    const calendars = await gfetch<{
        items: {
            id: string
        }[]
    }>("/calendar/v3/users/me/calendarList")

    const events = await Promise.all(calendars.items.map(calendar =>
        gfetch<{
            items: {
                id: string,
                colorId: string,
                summary: string,
                start: { dateTime: string },
                end: { dateTime: string },
            }[]
        }>(`/calendar/v3/calendars/${calendar.id}/events`, {
            "timeMin": time_min,
            "timeMax": time_max,
            "singleEvents": "true",
            "orderBy": "startTime",
            "maxResults": "20",
        })
    ))

    return events.flatMap(event => event.items.map(item => ({
        name: item.summary,
        start: item.start.dateTime ? new Date(item.start.dateTime) : undefined,
        end: item.end.dateTime ? new Date(item.end.dateTime) : undefined,
    })))
}

function get_date_range(now = new Date()) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start)
    end.setDate(start.getDate() + 1)

    return {
        time_min: start.toISOString(),
        time_max: end.toISOString()
    }
}

_.events_widget = async (attrs, _children) => {
    const date = (attrs.date as Date) ?? new Date()

    const agenda = await get_agenda(date)

    const start_h = 8
    const end_h   = 24

    const progress = (
        (new Date().getTime() - at("8:00").getTime()) /
        (at("24:00").getTime() - at("8:00").getTime())
    ) * 100

    return _.article({ class: "flex col" }, [
        _.label({}, [`Agenda for ${format_date_title(date, false)}`]),
        _.div({ class: "flex col relative" }, [
            ...is_today(date) ? [
                _.div({
                    class: "agenda-fill",
                    style: `bottom: ${100 - progress}%`
                })
            ] : [],
            _.div({
                class: "agenda",
                contenteditable: "true",
                href: `.hidden/agenda/${format_date_file(date)}.md`,
            }, [
                ...agenda.split("\n").map(line =>
                    _.div({}, [ line || "<br>" ])
                )
            ]),
            ...range(end_h - start_h, start_h).map(hour =>
                _.div({ class: "flex row agenda-row" }, [
                    _.div({ class: "agenda-time" }, [ `${hour}` ])
                ])
            ),
        ])
    ])
}

function format_date_file(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

async function get_agenda(date=new Date()): Promise<string> {
    if (await exists(`${config.notes_dir}/.hidden/agenda/${format_date_file(date)}.md`)) {
        return readFile(`${config.notes_dir}/.hidden/agenda/${format_date_file(date)}.md`, "utf-8")
    }
    const agenda = range((24 - 8) * 2).map(() => "")

    for (const event of await get_todays_events(date)) {
        agenda[get_agenda_slot(event.start!)] = event.name
        if (get_agenda_slot(event.end!) > get_agenda_slot(event.start!) + 1) {
            agenda[get_agenda_slot(event.end!) - 1] = "---"
        }
    }

    return agenda.join("\n")
}

function get_agenda_slot(time: Date) {
    if (time.getHours() === 0) return (24 - 8) * 2
    return (time.getHours() - 8) * 2 + Math.floor(time.getMinutes() / 30)
} 

export function format_date_title(date: Date=new Date(), year=true): string {
    const month = date.toLocaleString('en-US', { month: 'long' })
    const day = date.getDate()
    const suffix = get_day_suffix(day)
    if (year) {
        return `${month} ${day}${suffix}, ${date.getFullYear()}`
    } else {
        return `${month} ${day}${suffix}`
    }
}

function get_day_suffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
    }
}

export function is_today(date: Date) {
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
}

export function is_past(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
}

export function at(time: string) {
    const now = new Date()
    const [h, m] = time.split(":").map(Number)
    now.setHours(h)
    now.setMinutes(m)
    return now
}