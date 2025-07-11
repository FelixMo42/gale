import { RedirectResponse, Request } from "./router.ts"
import { range } from "./utils.ts"
import { _, PageResponse } from "./html.ts"
import { format_date_title, is_past, is_today } from "./events.ts"

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

_.status_widget = (_attrs, _children) => {
    return _.article({ }, [
        _.label({}, [`Currently doing nothing!`]),
    ])
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

    if (is_today(date)) base += " is_today"
    if (is_past(date)) base += " is_past"

    return base
}

interface MyDate extends Date {
    myWeek: number
    myDay: number
}
