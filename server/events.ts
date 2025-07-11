import { gfetch } from "./gauth.ts"

import { config } from "../config.ts"

interface Event {
    name: string,
    start?: Date,
    end?: Date,
    color?: string,
}

export async function get_todays_events(date=new Date()): Promise<Event[]> {
    const gevent = (await get_events(date).catch(() => [])).filter(event => !!event.start)

    const events = [
        ...config.events,
        ...gevent,
    ].sort((a, b) => a.start!.getTime() - b.start!.getTime())

    const full_event = [] as Event[]

    for (let i = 0; i < events.length; i++) {
        full_event.push(events[i])
        if (i + 1 < events.length) full_event.push({
            name: "~~filler~~",
            start: events[i].end,
            end: events[i + 1].start,
            color: "lightgrey",
        })
    }

    return full_event
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
