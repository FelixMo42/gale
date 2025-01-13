import CalenderView, { getCurrentCalenderTask } from "./els/calender"
import { _, Children, col, flex, row } from "./html"

function NowView() {
    const calenderEvent = getCurrentCalenderTask()

    return box(
        _.label("What should I be doing right now?"),
        pad(
            row(
                flex(`Right now from calender: `, _.span.withClass("underline")(calenderEvent[0].name)),
                button()
            )
        )
    )
}

function button() {
    return _.button("dismiss")
}

function pad(...children: Children) {
    return _.div.withClass("pad")(...children)
}

function box(...children: Children) {
    return _.div.withClass("box")(...children)
}

export default function main() {
    return col(
        _.h1("My Second Brain"),
        _.br(),
        NowView(),
        _.br(),
        CalenderView()
    )
}
