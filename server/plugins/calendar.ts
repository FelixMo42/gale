import { RedirectResponse, Request } from "../lib/router.ts"
import { range } from "../lib/utils.ts"
import { _, PageResponse } from "../lib/html.ts"
import * as time from "../lib/time.ts"

import { config } from "../../config.ts"

export function calendar(req: Request) {
    if (req.url === "/") {
        return RedirectResponse(`/diary/${time.format_date_file(new Date())}`)
    } else if (req.url?.match(/^\/diary\/\d\d\d\d-\d\d?-\d\d?$/)) {
        const date = new Date(req.url.slice(7))
        const week = Math.floor(time.date_to_cycle_day(date) / 7) + 1

        return PageResponse({ title: time.format_date_title(date) }, [
            _.aside({}, [
                _.calendar({ date }),
                _.editor({
                    href: `/.hidden/week/${week}.md`,
                    class: "flex scroll editor"
                }),
            ]),
            _.main({}, [
                _.editor({
                    href: `/diary/${time.format_date_file(date)}.md`
                })
            ]),
            _.aside({}, [
                _.agenda({ date }),
                _.status_widget({}),
            ]),
            _.search_modal({})
        ])
    }
}

_.calendar = (_attrs, _children) => {
    return _.article({}, [
        _.label({}, [config.name]),
        ...range(12).map(week =>
            _.div({ class: "row" }, [
                ...range(7, week * 7).map(day => {
                    const date = time.cycle_day_to_date(config.start, day)
                    return _.a({
                        class: `day ${get_calendar_day_class(date)}`,
                        href: `/diary/${time.format_date_file(date)}`
                    }, [date.getDate()])
                })
            ])
        )
    ])
}

_.status_widget = (_attrs, _children) => {
    return _.article({ }, [
        _.label({
            onclick: "alert('focus time!')",
            style: "cursor: pointer;"
        }, [`Focus TIME!`]),
    ])
}

function get_calendar_day_class(date: Date) {
    let base = `month-${date.getMonth()}`

    if (time.is_today(date)) base += " is_today"
    if (time.is_past(date)) base += " is_past"

    return base
}
