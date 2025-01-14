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
        row(
            _.div.withClass("box", "red").style({ flex: 2 })(
                _.label("To Do"),
                _.div.style({ height: 300, overflow: "scroll" })(
                    pad("Grocery Shopping 🍴"),
                    pad("Clean my room 🏠"),
                    pad("Do Laundry 🎒"),
                    pad("Camping Solution 🎒"),
                    pad("Global Charging Solution 🎒"),
                    pad("Fix my Pants 🎒"),
                    pad("Get a Keffiyeh 🎒"),
                    pad("Get a folder for papers 🎒"),
                    pad("Univenting the Gun ✍🏻"),
                    pad("Life Design ✍🏻"),
                    pad("Visit Temp Agency 👔"),
                    pad("Verify on LinkedIn 👔 #short"),
                    pad("Edit Resume 👔"),
                    pad("Reply to Miles 👥 #short"),
                    pad("Reply to Papa 👥 #short"),
                    pad("Make Tacocat Album 👥"),
                    pad("Work on Gale ⚙️")
                )
            ),
            _.div.withClass("col").style({ flex: 1 })(
                _.div.withClass("box", "blue")(
                    _.label("Today (3/3)"),
                    pad("New Pants 🎒"),
                    pad("SSN Paperwork 👔"),
                    pad("Reply to Julie 👥"),
                ),
                _.div.withClass("box", "green", "flex")(
                    _.label("Done"),
                    _.br(),
                ),
            ),
            
        ),
        _.br(),
        CalenderView()
    )
}
