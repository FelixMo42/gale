import { makeCalenderSource } from "../dates"
import { _, col, row } from "../html"

interface CalenderEvent {
    name: string,
    start: number,
    end: number,
    background?: string,
    color?: string,
}

export function queryCalender(date: Date=new Date()) {
    const events = MY_CALENDER.flatMap(source => source(date))
    const withoutOverlaps: CalenderEvent[] = []

    function overlaps(a: CalenderEvent, b: CalenderEvent) {
        return (b.start >= a.start && b.start < a.end) ||
            (a.start > b.start && a.start < b.end)
    }

    for (const event of events) {
        if (!withoutOverlaps.some(e => overlaps(event, e))) {
            withoutOverlaps.push(event)
        }
    }

    withoutOverlaps.sort((a, b) => a.start - b.start)

    const emptyBlocks: CalenderEvent[] = []

    for (let i = 0; i < withoutOverlaps.length - 1; i++) {
        const diff = withoutOverlaps[i+1].start - withoutOverlaps[i].end
        if (withoutOverlaps[i].end !== withoutOverlaps[i+1].start) {
            emptyBlocks.push({
                name: diff < 1 ? "" : "Empty",
                start: withoutOverlaps[i].end,
                end: withoutOverlaps[i+1].start,
                background: "#4C4E52",
            })
        }
    }

    return [
        ...withoutOverlaps,
        ...emptyBlocks
    ].sort((a, b) => a.start - b.start)
}

export function getCurrentCalenderTask(): CalenderEvent[] {
    const now = new Date().getHours()
    return queryCalender().filter(event => event.start >= now && now <= event.end)
}

const XR_CALENDER = [
    makeCalenderSource({
        name: "XR Nord",
        schedule: "every monday 19:00-22:00",
        background: "#556B2F"
    }),
    makeCalenderSource({
        name: "XR Rive-Gauche",
        schedule: "every thursday 18:00-21:00",
        background: "#556B2F"
    }),
]

const LIBRARY_CALENDER = [
    makeCalenderSource({
        name: "Biblio La Villet",
        schedule: "every weekday 1200-1700",
        background: "https://www.pixelstalk.net/wp-content/uploads/2016/08/Old-Library-Wallpaper.jpg",
    }),
]

const MY_CALENDER: Array<(date: Date) => CalenderEvent[]> = [

    // Work
    makeCalenderSource({
        name: "EA Meetup",
        schedule: "2025/1/18 1400-1800"
    }),

    // Social
    makeCalenderSource({
        name: "Le Louvre \\w Elise",
        schedule: "2025/1/13 1100-1500",
        background: "#2596be",
    }),
    makeCalenderSource({
        name: "Call \\w Eli",
        schedule: "every Sunday 1700-1900",
        background: "#2596be",
    }),

    // Maintenance
    makeCalenderSource({
        name: "",
        schedule: "everyday 8:00-9:00",
        background: "https://wallpapercave.com/wp/wp5019587.jpg"
    }),
    makeCalenderSource({
        name: "",
        schedule: "everyday 23:00-24:00",
        background: `url("img/bed.png")`,
    }),
    makeCalenderSource({
        name: "Go Thrift Shopping",
        schedule: "2025/1/14 9:00-12:00"
    }),

    // Import other calenders
    ...XR_CALENDER,
    ...LIBRARY_CALENDER,
]

export default function CalenderView() {
    return col(
        weekHeaders(),
        row(...getDatesForWeek(0).map(dayView)),
    )
}

function weekHeaders() {
    return row(...[
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
    ].map(dayName => _.div.withClass("center", "flex")(dayName)))
}

function dayView(date: Date) {
    const events = queryCalender(date)
    const skipHours = 8
    const pxPerHour = 550 / (24 - skipHours)

    return _.div.withClass("day")(
        date.getDate(),
        _.div.style({
            height: (25 - skipHours) * pxPerHour,
            padding: "0px 2px",
        })(...events.sort((a, b) => a.start - b.end).map(event => 
            _.div
                .withClass("calevent")
                .style({
                    height: (event.end - event.start) * pxPerHour,
                    top: (event.start - skipHours) * pxPerHour,
                    ...bg(event.background)
                })
                (_.span.withClass("shadow")(event.name))
        ))
    )
}

function bg(background: string) {
    if (!background) {
        return {}
    } else if (background.includes("http")) {
        return {
            "background-image": `url(${background})`
        }
    } else if (background.includes("url")) {
        return {
            "background-image": `${background}`
        }
    } else {
        return {
            "background-color": background
        }
    }              
}

function getDatesForWeek(week = 0) {
    const start = new Date()
    const dayOfWeek = start.getDay()
    start.setDate(start.getDate() - dayOfWeek + 1)
    
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date)
    }
    return dates
}
