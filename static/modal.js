window.addEventListener("load", () => {
    const input = document.querySelector("dialog input")
    input.oninput = () => search(input.value)
    input.onfocus = () => search(input.value)
    input.onkeydown = (event) => {
        if (event.key === "Enter") {
            document.querySelector("#results a:first-child").click()
        }
    }

    const modal = document.querySelector("dialog")
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.close()
    })

    modal.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault()
            moveInList(+1)
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            moveInList(-1)
        }
    })

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
            event.preventDefault()

            if (!modal.open) {
                input.value = ""
                modal.showModal()
            } else {
                input.focus()
            }
        }

        if (event.key === "Escape") {
            event.preventDefault()

            if (modal.open) modal.close()
        }
    })
})

async function search(q="") {
    const html = await fetch(`/api/search?q=${q}`).then(r => r.text())
    document.getElementById("results").innerHTML = html
}

function moveInList(mod) {
    const items = getCurrentSearchList()
    let focus = items.indexOf(document.activeElement)
    if (focus === -1) { focus = 0 }
    const index = Math.min(Math.max(focus + mod, 0), items.length - 1)
    console.log(focus, mod, '=', index)
    items[index].focus()
}

function getCurrentSearchList() {
    return [...document.querySelectorAll("dialog #results a")]
}
