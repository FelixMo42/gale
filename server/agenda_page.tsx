import { page } from "./utils/page"
import { AgendaWidget, HabitWidget } from "./widgets"
import * as time from "./utils/time.ts"
import { range } from "./utils/math.ts"

export async function agenda_page(req: Request) {
    return page("agenda", <>
        <main class="full col pad gap">
            <div class="row flex gap">
                <WeekWidget date={new Date()} />
            </div>
            <HabitWidget />
        </main>
    </>)
}

export function WeekWidget({ date = new Date() }) {
    const start_h = 8
    const end_h = 24

    const start = time.get_start_of_week(date)

    return <article class="flex col relative">
        <div class="col agenda-col">
            {range(end_h - start_h, start_h).map(hour =>
                <div class="flex row agenda-row">
                    <div class="agenda-time">{hour}</div>
                </div>
            )}
        </div>

        <div class="row">
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