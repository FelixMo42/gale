window.addEventListener("load", () => {
    document
        .querySelectorAll(".agenda")
        .forEach(attach_agenda)
})

function attach_agenda(agenda) {
    const path = agenda.getAttribute("href")

    agenda.oninput = () => {
        style_agenda(agenda)

        const body = html_to_md(agenda)
        fetch(path, { method: "POST", body })
    }

    style_agenda(agenda)
}

function style_agenda(agenda) {
    let mode = ""

    for (const line_el of agenda.children) {
        const line = line_el.innerText.trim()

        if (["wake up", "go too sleep"].includes(line)) {
            mode = "orange"
        } else if (line === "train") {
            mode = "yellow"
        } else if (["lunch", "dinner"].includes(line)) {
            mode = "green"
        } else if (line === "boat") {
            mode = "rgb(70, 130, 180)"
        } else if (line.startsWith("work")) {
            mode = "grey"
        } else if (line != "" && line != "---") {
            line_el.nextSibling
            mode = "red"
        }
        
        if (mode) {
            line_el.style.backgroundColor = mode
        } else {
            line_el.style.backgroundColor = ""
        }

        if (!is_long_event(line_el.nextSibling)) {
            mode = ""
        }

        if (line === "---") {
            mode = ""
        }
    }
}

function is_long_event(line_el) {
    if (!line_el) return false
    if (line_el.innerText.trim() === "---") return true
    if (line_el.innerText.trim() === "") return is_long_event(line_el.nextSibling)
    return false
}