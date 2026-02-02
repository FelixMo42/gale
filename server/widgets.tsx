import * as time from "./utils/time.ts"
import { range } from "./utils/math.ts"
import { cb, get, set } from "./utils/api.ts"
import { get_inbox } from "./inbox.tsx"

export function CalendarWidget({
    year = 2026,
    month = 2,
}) {
    const month_date = new Date(year, month - 1, 1)
    const month_offset = 1 - time.get_day(month_date)
    const month_name = month_date.toLocaleString('en-US', { month: 'long' })

    return <article>
        <label>
            <a>{"<"}</a>
            <div class="flex">{month_name} {year}</div>
            <a>{">"}</a>
        </label>
        {range(6).map(week => <div class="row">
            {range(7).map(day => {
                const days_since_start = week * 7 + day + month_offset
                const date = new Date(year, month - 1, days_since_start)
                return <a
                    class={`day ${get_calendar_day_class(date)}`}
                    href={`/diary/${time.format_date_file(date)}`}
                >{date.getDate()}</a>
            })}
        </div>)}
    </article>

    function get_calendar_day_class(date: Date) {
        let base = `month-${date.getMonth()}`

        if (time.is_today(date)) base += " is_today"
        if (time.is_past(date)) base += " is_past"

        return base
    }
}

export function InboxWidget() {
    return <article class="flex scroll" hx-get={get_inbox} hx-trigger="load">
    </article>
}

export function AgendaWidget({ date = new Date() }) {
    const start_h = 8
    const end_h   = 24

    return <article class="flex col">
        <div class="flex col relative">
            <div
                class="editor agenda"
                contenteditable="true"
                href={`/fs/.hidden/agenda/${time.format_date_file(date)}.md`}
            ></div>
            {range(end_h - start_h, start_h).map(hour =>
                <div class="flex row agenda-row">
                    <div class="agenda-time">{hour}</div>
                </div>
            )}
        </div>
    </article>
}

function habit_streak(name: string, date=new Date()) {
    console.log(get<number>(`habit.${name}.${time.format_date_file(time.today(date))}`))
    return (
        get<number>(`habit.${name}.${time.format_date_file(time.today(date))}`) ??
        get<number>(`habit.${name}.${time.format_date_file(time.yesterday(date))}`) ??
        0
    )
}

function habit_toggle(name: string) {
    return set(
        `habit.${name}.${time.format_date_file(time.yesterday())}`,
        habit_streak(name, time.yesterday()) + 1
    )
}

const click_yoga = cb(() => habit_toggle("yoga"))
const click_grow = cb(() => habit_toggle("grow"))
const click_live = cb(() => habit_toggle("live"))

export function HabitWidget() {
    const style = (bg: string) => ({
        background: `url(/fs/.hidden/images/${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "black",
        padding: "5px",
        textAlign: "center",
        cursor: "pointer",
    } as JSX.CSSProperties)

    return <article>
            <div class="flex row">
                <a
                    class="flex"
                    style={style("heart.jpg")}
                    hx-get={click_yoga}
                >{habit_streak("yoga")}</a>
                <div
                    class="flex"
                    style={style("garden.png")}
                    hx-get={click_grow}
                >{habit_streak("grow")}</div>
                <div
                    class="flex"
                    style={style("water.png")}
                    hx-get={click_live}
                >{habit_streak("live")}</div>
            </div>
    </article>
}
