window.addEventListener("load", () => {
    document
        .querySelectorAll(".agenda")
        .forEach(attach_agenda)
})

function attach_agenda(agenda) {
    agenda.preedit = (area, text) => {
        return [area, text]
    }

    agenda.postedit = () => style_agenda(agenda)
    agenda.onload = () => style_agenda(agenda)
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

            bg.style.background = get_event_bg(name.toLowerCase())

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
    if (["wake up"].includes(name)) {
        return "url(/.hidden/images/sun.png) no-repeat center / cover"
    } else if (["go too sleep"].includes(name)) {
        return "url(/.hidden/images/night.png) no-repeat center / cover"
    } else if (name.includes("train")) {
        return "url(/.hidden/images/rail.png) repeat-y right center / 50%"

    } else if (name.startsWith("work")) {
        return bg("work.png", "rgba(255, 255, 255, 0.5)")

    } else if (name.includes("lunch") || name.includes("dinner")) {
        return bg("food.png", tags.refresh)
    
    } else if (name.includes("meeting")) {
        return bg("meeting.png", tags.important)

    } else if (name.includes("baby")) {
        return bg("charles.png", tags.social)
    } else if (name.includes("eli")) {
        return bg("eli.png", tags.social)
    } else if (name.includes("peter")) {
        return bg("peter.png", tags.social)
    } else if (name.includes("alex")) {
        return tags.social
    } else if (name.includes("social") || name.includes("call") || name.includes("meetup")) {
        return tags.social

    } else if (name.includes("movie")) {
        return tags.project
    } else if (name.includes("utg")) {
        return tags.project

    } else if (name != "" && name != "---") {
        return "red"
    }
}

const tags = {
    social: `rgba(0, 0, 155, 0.4)`,
    important: `rgba(255, 0, 0, .6)`,
    refresh: `rgba(0, 155, 0, 0.4)`,
    project: "brown"
}

function bg(image, color) {
    if (!color) {
        return `url(/.hidden/images/${image}) no-repeat center / cover`
    } else {
        return `linear-gradient(${color}, ${color}), ${bg(image)}`
    }
}
