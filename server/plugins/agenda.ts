import { readFile } from "node:fs/promises"

import { _, PageResponse } from "../lib/html.ts"
import { gfetch } from "../lib/gauth.ts"
import { exists, range } from "../lib/utils.ts"
import { Request } from "../lib/router.ts"
import * as time from "../lib/time.ts"

import { config } from "../../config.ts"

export function agenda(req: Request) {
    if (req.url === "/agenda") {
        const style = [
            "height: 100vh",
            "width: 100vw",
            "display: flex",
            "flex-direction: row",
        ].join(";")
    
        const week = time.get_start_of_week(new Date())

        return PageResponse({ title: "agenda" }, [
            _.aside({ style, class: "pad-0" }, [
                _.agenda({ date: time.add_days(week, 0) }),
                _.agenda({ date: time.add_days(week, 1) }),
                _.agenda({ date: time.add_days(week, 2) }),
                _.agenda({ date: time.add_days(week, 3) }),
                _.agenda({ date: time.add_days(week, 4) }),
                _.agenda({ date: time.add_days(week, 5) }),
                _.agenda({ date: time.add_days(week, 6) }),
            ]),
            _.search_modal({})
        ])
    }
}

interface Event {
    name: string,
    start?: Date,
    end?: Date,
    color?: string,
}

_.agenda = async (attrs, _children) => {
    const date = (attrs.date as Date) ?? new Date()

    const agenda = await get_agenda(date)

    const start_h = 8
    const end_h   = 24

    const progress = (
        (new Date().getTime() - time.at("8:00").getTime()) /
        (time.at("24:00").getTime() - time.at("8:00").getTime())
    ) * 100

    return _.article({ class: "flex col" }, [
        _.label({}, [ `Agenda for ${time.format_date_title(date, false)}`]),
        _.div({ class: "flex col relative" }, [
            ...time.is_today(date) ? [
                _.div({
                    class: "agenda-fill",
                    style: `bottom: ${100 - progress}%`
                })
            ] : [],
            _.div({
                class: "agenda",
                contenteditable: "true",
                href: `/.hidden/agenda/${time.format_date_file(date)}.md`,
            }, [
                ...agenda.split("\n").map(line =>
                    _.div({}, [ line || "<br>" ])
                )
            ]),
            ...range(end_h - start_h, start_h).map(hour =>
                _.div({ class: "flex row agenda-row" }, [
                    _.div({ class: "agenda-time" }, [ `${hour}` ])
                ])
            )
        ])
    ])
}

async function get_agenda(date=new Date()): Promise<string> {
    const path = `${config.notes_dir}/.hidden/agenda/${time.format_date_file(date)}.md`

    if (await exists(path)) {
        return readFile(path, "utf-8")
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

async function get_todays_events(date=new Date()): Promise<Event[]> {
    const gevent = (await get_events(date).catch(() => []))
        .filter(event => !!event.start)

    return [
        ...config.events,
        ...gevent,
    ].sort((a, b) => a.start!.getTime() - b.start!.getTime())
}

async function get_events(date=new Date()) {
    const { time_min, time_max } = time.get_date_range(date)

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

function get_agenda_slot(time: Date) {
    if (time.getHours() === 0) return (24 - 8) * 2
    return (time.getHours() - 8) * 2 + Math.floor(time.getMinutes() / 30)
} 
