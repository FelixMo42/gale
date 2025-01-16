import { _ } from "./html"
import { update } from "./update"

export const nav = ["My_Second_Brain.md", "Get_A_Job.md"]

export function goTo(page: string) {
    nav[1] = page
    update()
}
