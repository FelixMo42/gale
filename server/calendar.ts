import { RedirectResponse, Request } from "./router.ts"
import { range } from "./utils.ts"
import { _, PageResponse } from "./html.ts"
import { get_todays_events } from "./events.ts"

import { config } from "../config.ts"

export function calendar(req: Request) {
    if (req.url === "/") {
        const now = new Date()
        return RedirectResponse(`/${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`)
    } else if (req.url?.match(/^\/\d\d\d\d-\d\d?-\d\d?$/)) {
        const date = new Date(req.url.slice(1))
        const day = currentDay(req.url.slice(1))

        const title = format_date_title(date)

        return PageResponse({ title }, [
            _.aside({}, [
                _.calendar_widget({}),
                _.editor({ href: `/year/0/week/${Math.floor(day / 7) + 1}.md`, class: "flex scroll editor" }),
            ]),
            _.main({}, [
               _.editor({ href: `/year/0/diary/${day}.md` })
            ]),
            _.aside({}, [
                _.events_widget({ date }),
                _.status_widget({}),
            ]),
            _.search_modal({})
        ])
    }
}


_.calendar_widget = (_attrs, _children) => {
    return _.article({}, [
        _.label({}, [config.name]),
        ...range(12).map(week =>
            _.div({ class: "row" }, [
                ...range(7, week * 7).map(day => {
                    const date = addDays(config.start, day)
                    return _.a({
                        class: `day ${calendar_class(date)}`,
                            href: `/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                    }, [date.getDate()])
                })
            ])
        )
    ])
}

_.events_widget = async (attrs, _children) => {
    const date = (attrs.date as Date) ?? new Date()

    const events = await get_todays_events(date)

    const start = events[0].start!
    const end = events[events.length - 1].end!

    const progress = (new Date().getTime() - start.getTime()) / (end.getTime() - start.getTime())

    return _.article({ class: "flex col" }, [
        _.label({}, [`Agenda for ${format_date_title(date, false)}`]),
        _.div({ class: "flex col relative" }, [
            ...isToday(date) ? [
                _.div({ class: "progress", style: `height: calc((100% - 20px) * ${progress} + 10px)` }),
            ] : [],
            _.div({ class: "flex pad col" }, [
                ...events.map((event) =>
                    _.div({
                        class: event.name.startsWith("~~") ? "event filler" : "event",
                        style: `background-color: ${event.color ?? "lightpink"}; flex: ${event.end!.getTime() - event.start!.getTime()};`,
                    }, [
                        _.div({}, [ event.name ? `${event.name} (${format_time(event.start!)}-${format_time(event.end!)})` : "" ])
                    ])
                ),
            ])
        ])
    ])
}

_.dashboard_widget = (_attrs, _children) => {
    return _.article({ class: "flex" }, [
        _.label({}, [`Tasks`]),
        _.div({}, [])
    ])
}

_.status_widget = (_attrs, _children) => {
    return _.article({ }, [
        _.label({}, [`Currently doing nothing!`]),
    ])
}

function format_time(date: Date) {
    const mins = String(date.getMinutes()).padStart(2, "0")
    return `${date.getHours()}:${mins}`
}

function format_date_title(date: Date=new Date(), include_year=true): string {
    const month = date.toLocaleString('en-US', { month: 'long' })
    const day = date.getDate()
    const suffix = get_day_suffix(day)
    if (include_year) {
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

function currentDay(date: number | string | Date = new Date()) {
    const current = new Date(date)
    current.setHours(8)
    const diffInMs = current.getTime() - config.start.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    if (diffInDays >= 12 * 7) return 0
    return diffInDays
}

function addDays(date: Date, days: number): MyDate {
    const d = new Date(date) as MyDate
    d.setDate(d.getDate() + days)
    d.myWeek = Math.floor(days / 7)
    d.myDay = days % 7
    return d
}

const calendar_class = (date: Date) => {
    let base = `month-${date.getMonth()}`

    if (isToday(date)) base += " is_today"
    if (isPast(date)) base += " is_past"

    return base
}

function isToday(date: Date) {
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
}

function isPast(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
}

interface MyDate extends Date {
    myWeek: number
    myDay: number
}
