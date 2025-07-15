import { config } from "../../config.ts"

export function get_end_of_day() {
    const now = new Date()
    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    )
}

export function date_to_cycle_day(date: Date) {
    const current = new Date(date)
    current.setHours(8)
    const ms = current.getTime() - config.start.getTime()
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    if (days >= 12 * 7) return 0
    return days
}

export function cycle_day_to_date(start: Date, days: number): Date {
    return add_days(start, days)
}

export function add_days(start: Date, days: number): Date {
    const date = new Date(start)
    date.setDate(date.getDate() + days)
    return date
}

export function get_date_range(now = new Date()) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start)
    end.setDate(start.getDate() + 1)

    return {
        time_min: start.toISOString(),
        time_max: end.toISOString()
    }
}

export function format_date_file(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function format_date_title(date: Date=new Date(), year=true): string {
    const month = date.toLocaleString('en-US', { month: 'long' })
    const day = date.getDate()
    const suffix = get_day_suffix(day)
    if (year) {
        return `${month} ${day}${suffix}, ${date.getFullYear()}`
    } else {
        return `${month} ${day}${suffix}`
    }
}

export function get_day_suffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
    }
}

export function is_today(date: Date) {
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
}

export function is_past(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
}

export function at(time: string) {
    const now = new Date()
    const [h, m] = time.split(":").map(Number)
    now.setHours(h)
    now.setMinutes(m)
    return now
}

export function get_start_of_week(date: Date=new Date()) {
    const day = date.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    return add_days(date, diff)
}