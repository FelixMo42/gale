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
    // remove old backgrounds
    agenda.querySelectorAll(".agenga-bg").forEach(el => el.remove())

    for (const line of agenda.children) {
        const name = line.innerText.trim()
        if (name) {
            const bg = document.createElement("div")
        
            bg.className = "agenga-bg"

            bg.style.position = "absolute"
            bg.style.top    = `0px`
            bg.style.height = `${100 * get_event_length(line)}%`
            bg.style.left   = `0px`
            bg.style.right  = `0px`

            bg.style.zIndex = "-1"

            bg.style.background = get_event_bg(name)

            bg.style.opacity = "50%"

            line.appendChild(bg)
        }
    }
}

function get_event_length(line, length=1) {
    if (!line.nextSibling) return 1
    if (line.nextSibling.innerText.trim() === "---") return length + 1
    if (line.nextSibling.innerText.trim() === "") return get_event_length(line.nextSibling, length + 1)
    return 1
}

function get_event_bg(name) {
    if (["wake up", "go too sleep"].includes(name)) {
        return "url(/.hidden/images/sun.png)"
    } else if (name === "train") {
        return "yellow"
    } else if (["lunch", "dinner"].includes(name)) {
        return "green"
    } else if (name.includes("boat")) {
        return "rgb(70, 130, 180)"
    } else if (name.startsWith("work")) {
        return "grey"
    } else if (name != "" && name != "---") {
        return "red"
    }
}
