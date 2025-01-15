import { _ } from "./html"
import { update } from "./update"

export const nav = ["My_Second_Brain.md", "SSN_Paperwork.md"]

export function goTo(page: string) {
    nav.push(page)
    update()
}
