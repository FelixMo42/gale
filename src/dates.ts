const DaysOfTheWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
]

interface CalenderSourceProps {
    name: string,
    schedule: string,
    background?: string,
    color?: string,
}

function makeEverdayCalenderSource({ name, schedule }: CalenderSourceProps) {
    return () => true
}

function makeRepeatCalenderSource({ name, schedule }: CalenderSourceProps) {
    const daysOfTheWeek = DaysOfTheWeek.map((day, id) => schedule.toUpperCase().includes(day.toUpperCase()) ? id : -1)
    return (q: Date) => daysOfTheWeek.includes(q.getDay())
}

function makeSingleDayCalenderSource({ name, schedule }: CalenderSourceProps) {
    const { year, month, date } = parseDate(schedule)
    return (q: Date) => q.getFullYear() === year &&
            q.getMonth() === month &&
            q.getDate() == date
}

function getQuery(props: CalenderSourceProps) {
    if (props.schedule.includes("everyday")) {
        return makeEverdayCalenderSource(props)
    } else if (props.schedule.includes("weekday")) {
        return (date: Date) => date.getDay() >= 1 && date.getDay() <= 5
    } else if (props.schedule.includes("every")) {
        return makeRepeatCalenderSource(props)
    } else {
        return makeSingleDayCalenderSource(props)
    }
}

export function makeCalenderSource(props: CalenderSourceProps) {
    const query = getQuery(props)
    const { start, end } = parseHours(props.schedule)
    return (q: Date) => {
        if (query(q)) {
            return [{ start, end, ...props }]
        } else {
            return []
        }
    }
}

function parseDate(schedule: string) {
    // Matches the "YYYY/MM/DD" pattern
    const match = schedule.match(/(\d+)\/(\d+)\/(\d+)/)
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const date = Number(match[3])
    return { year, month, date }
}

function parseHours(schedule: string) {
    // Matches the "HH:MM-HH:MM" pattern
    const match = schedule.match(/(\d+:?\d{2})-(\d+:?\d{2})/)
    const start = parseHour(match[1])
    const end = parseHour(match[2])
    return { start, end }
}

function parseHour(hour: string) {
    const total = Number(hour.replace(":", ""))
    const minutes = total & 100
    const hours = (total - minutes) / 100
    return hours + minutes / 60
}
