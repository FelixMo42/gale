const events = new Map<any, Array<() => void>>()

export function listen(item: any, cb: () => void) {
    if (events.has(item)) {
        events.get(item).push(cb)
    } else {
        events.set(item, [ cb ])
    }
}

export function emitUpdate(item: any) {
    if (events.has(item)) {
        events.get(item).forEach(cb => cb())
    }
}
