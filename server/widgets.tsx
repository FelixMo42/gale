import * as time from "./utils/time.ts"
import { range } from "./utils/math.ts"
import { cb, get, set } from "./utils/api.ts"

export function CalendarWidget({ month = "24314" }) {
    const m = Number(month) % 12
    const y = (Number(month) - m) / 12
    const month_date = new Date(y, m - 1, 1)
    const month_offset = 1 - time.get_day(month_date)
    const month_name = month_date.toLocaleString('en-US', { month: 'long' })

    return <article>
        <label>
            <a href={`?m=${y * 12 + m - 1}`}>{"<"}</a>
            <div class="flex">{month_name} {y}</div>
            <a href={`?m=${y * 12 + m + 1}`}>{">"}</a>
        </label>
        {range(6).map(week => <div class="row">
            {range(7).map(day => {
                const days_since_start = week * 7 + day + month_offset
                const date = new Date(y, m - 1, days_since_start)
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

function bg(image: string, color?: string): string {
    if (!color) {
        return `url(/fs/.hidden/images/${image}) no-repeat center / cover`
    } else {
        return `linear-gradient(${color}, ${color}), ${bg(image)}`
    }
}

export function ProjectsWidget() {
    const projects = [
        {
            name: "Entrelacs",
            url: "/project/Entrelacs",
            bg: bg("entrelacs.png")
        },
        {
            name: "Metaculus",
            url: "/project/Metaculus",
            bg: bg("metaculus.png")
        },
        {
            name: "EA42",
            url: "/project/ea42",
            bg: bg("ea42.png"),
        },
        {
            name: "42",
            url: "/project/42",
            bg: bg("e42.png", "rgba(255, 255, 255, 0.6)"),
        },
        {
            name: "Pause IA",
            url: "/project/pauseia",
            bg: bg("pauseia.png"),
        },
        {
            name: "AISC",
            url: "/project/aisc",
            bg: bg("aisc.png"),
        },
        {
            name: "Protection Civile",
            url: "/project/protec",
            bg: bg("protection_civile.png", "rgba(255, 255, 255, 0.5)")
        },
        {
            name: "Gale",
            url: "/project/gale",
            bg: bg("gale.png"),
        },
        {
            name: "Untitled Pedent Game",
            url: "/project/pedent",
            bg: bg("eli.png", "rgba(100, 100, 200, 0.5)")
        }
    ]

    return <article class="flex col scroll" hx-trigger="load">
        {projects.map(({ name, url, bg }) =>
            <a href={url} class="pad bb" style={{
                background: bg,
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                color: "black"
            }}>{name}</a>
        )}
    </article>
}

export function AgendaWidget({ date = new Date() }) {
    const start_h = 8
    const end_h = 24

    return <article class="flex col">
        <div class="flex col relative">
            <div
                class="editor agenda"
                contenteditable="true"
                href={`/fs/.hidden/agenda/${time.format_date_file(date)}.md`}
                data-date={time.format_date_file(date)}
            ></div>
            {range(end_h - start_h, start_h).map(hour =>
                <div class="flex row agenda-row">
                    <div class="agenda-time">{hour}</div>
                </div>
            )}
        </div>
    </article>
}

function habit_streak(name: string, date = new Date()) {
    return (
        get<number>(`habit.${name}.${time.format_date_file(time.today(date))}`) ??
        get<number>(`habit.${name}.${time.format_date_file(time.yesterday(date))}`) ??
        0
    )
}

function habit_toggle(name: string) {
    return set(
        `habit.${name}.${time.format_date_file(time.today())}`,
        habit_streak(name, time.yesterday()) + 1
    )
}

const click_yoga = cb(() => String(habit_toggle("yoga")))
const click_grow = cb(() => String(habit_toggle("grow")))
const click_live = cb(() => String(habit_toggle("live")))

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
