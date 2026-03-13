import { page } from "../utils/page.tsx"
import * as time from "../utils/time.ts"
import { range } from "../utils/math.ts"
import { getAgendaItems } from "../utils/events.ts"

export async function agenda_page(req: Request) {
    const date = new Date(
        new URL(req.url).searchParams.get("date") ??
        new Date().toISOString()
    )

    return page("agenda", <>
        <main class="full col pad gap">
            <WeekWidget week={date} />
            <TimetrackerWidget week={date}  />
        </main>
    </>)
}

export function WeekWidget({ week = new Date() }) {
    const start_h = 8
    const end_h = 24

    const start = time.get_start_of_week(week)

    return <article class="col relative">
        <div class="col agenda-col">
            {range(end_h - start_h, start_h).map(hour =>
                <div class="flex row agenda-row">
                    <div class="agenda-time">{hour}</div>
                </div>
            )}
        </div>

        <div class="row" style={{ maxHeight: "100%" }}>
            {range(7).map(day => time.add_days(start, day)).map(date =>
                <div
                    class="editor agenda flex"
                    contenteditable="true"
                    href={`/fs/.hidden/agenda/${time.format_date_file(date)}.md`}
                    data-date={time.format_date_file(date)}
                ></div>
            )}
        </div>
    </article>
}

export async function TimetrackerWidget({ week = new Date() }) {
    const start = time.get_start_of_week(week)

    const events = (await Promise.all(range(7)
        .map(day => time.add_days(start, day))
        .map(getAgendaItems)
    )).flat()

    const timespent = new Map<string, number>();

    for (const event of events) {
        timespent.set(
            event.type,
            (timespent.get(event.type) ?? 0) + event.span
        )
    }

    timespent.delete("life")
    timespent.delete("misc")

    const times = [...timespent.entries()].sort((a, b) => b[1] - a[1])

    return <article class="row scroll">
        {times.map(([name, time]) => 
            <div style={{
                flex: time,
                textWrap: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
            }} class="br pad">{name} ({time}h)</div>
        )}
    </article>
}
