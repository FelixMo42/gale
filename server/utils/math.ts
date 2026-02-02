export function range(length: number, start: number = 0) {
    return new Array(length).fill(0).map((_, i) => i + start)
}
