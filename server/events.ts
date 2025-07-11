import { gfetch } from "./gauth.ts"
import { _ } from "./html.ts"
import { range } from "./utils.ts"

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

    const events = await get_todays_events(date)

    const start = events[0].start!
    const end = events[events.length - 1].end!

    const start_h = start.getHours()
    const end_h   = 24

    // const progress = (new Date().getTime() - start.getTime()) / (end.getTime() - start.getTime())

    return _.article({ class: "flex col" }, [
        _.label({}, [`Agenda for ${format_date_title(date, false)}`]),
        _.div({ class: "flex col relative" }, [
            ...is_today(date) ? [
                _.div({
                    class: "agenda-fill",
                    style: `bottom: ${100 - calc_p(new Date())}%`
                })
            ] : [],
            ...events.map(event =>
                _.div({
                    class: "event",
                    style: [
                        `top: ${calc_p(event.start!)}%`,
                        `bottom: ${100 - calc_p(event.end!)}%`,
                        `background-color: ${event.color ?? 'pink'}`,
                    ].join(";"),
                }, [ event.name ])
            ),
            ...range(end_h - start_h, start_h).map(hour =>
                _.div({ class: "flex row agenda-row" }, [
                    _.div({ class: "agenda-time" }, [ `${hour}` ])
                ])
            ),
        ])
    ])

    function calc_p(date: Date) {
        return (date.getTime() - start.getTime()) / (end.getTime() - start.getTime()) * 100
    } 
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