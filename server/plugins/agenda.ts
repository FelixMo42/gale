import { _, PageResponse } from "../lib/html.ts"
import { range } from "../lib/utils.ts"
import { Request } from "../lib/router.ts"
import * as time from "../lib/time.ts"

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

_.agenda = (attrs, _children) => {
    const date = (attrs.date as Date) ?? new Date()

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
                class: "editor agenda",
                contenteditable: "true",
                href: `/.hidden/agenda/${time.format_date_file(date)}.md`,
            }),
            ...range(end_h - start_h, start_h).map(hour =>
                _.div({ class: "flex row agenda-row" }, [
                    _.div({ class: "agenda-time" }, [ `${hour}` ])
                ])
            )
        ])
    ])
}
