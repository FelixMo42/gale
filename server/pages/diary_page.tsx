import { get_path, param } from "../utils/misc";
import { add_page, page } from "../utils/page";
import { AgendaWidget, CalendarWidget, HabitWidget, ProjectsWidget } from "../widgets";
import * as time from "../utils/time";

add_page("/diary/*", async (req: Request) => {
    return page("diary", <>
        <aside>
            <CalendarWidget month={param(req, "m")} />
            <ProjectsWidget />
        </aside>
        <main>
            <div
                class="editor"
                data-file={`/fs/${get_path(req)}.md`}
                contenteditable="true"
            ></div>
        </main>
        <aside>
            <AgendaWidget date={time.get_date_from_request(req)} />
            <HabitWidget />
        </aside>
    </>)
})
