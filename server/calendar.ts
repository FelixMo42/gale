import { Request } from "./router.ts"
import { range } from "./utils.ts"
import { _, PageResponse } from "./html.ts"

import { config } from "../config.ts"

export function calendar(req: Request) {
    if (req.url?.match(/^\/\d\d\d\d-\d\d?-\d\d?$/)) {
        const day = currentDay(req.url.slice(1))

        const title = format_date_title(new Date(req.url.slice(1)))

        return PageResponse({ title }, [
            _.aside({}, [ _.calendar_widget({}) ]),
            _.main({}, [
                _.section({}, [
                    _.editor({ href: `/year/0/diary/${day}.md` })
                ]),
                _.aside({}, [
                    _.editor({ href: `/year/0/week/${Math.floor(day / 7) + 1}.md` })
                ])
            ])
        ])
    }
}

_.calendar_widget = (_attrs, _children) => {
    return _.section({ class: "calendar" }, [
        _.label({}, [config.name]),
        ...range(12).map(week =>
            _.div({ class: "week" }, [
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

function format_date_title(date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'long' })
    const day = date.getDate()
    const suffix = get_day_suffix(day)
    return `${month} ${day}${suffix}, ${date.getFullYear()}`
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
    let base = ""

    if (isToday(date)) base += "is_today "
    if (isPast(date)) base += "is_past "

    if (date.getMonth() == 7) {
        return base + `e42`
    } else if (date.getMonth() < 7) {
        return base + `conflan`
    } else {
        return base + `hike`
    }
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
