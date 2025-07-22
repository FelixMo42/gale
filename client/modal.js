window.addEventListener("load", () => {
    const input = document.querySelector("dialog input")
    input.oninput = () => search(input.value)
    input.onfocus = () => search(input.value)
    
    const modal = document.querySelector("dialog")
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.close()
    })

    modal.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()

            const items = getCurrentSearchList()
            const focus = items.indexOf(document.activeElement)
            items.at((focus + 1) % items.length).focus()
        }

        if (event.key === "ArrowUp") {
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()

            const items = getCurrentSearchList()
            const focus = items.indexOf(document.activeElement)
            items.at((focus - 1) % items.length).focus()
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

function getCurrentSearchList() {
    return [
        document.querySelector("dialog input"),
        ...document.querySelectorAll("dialog #results a")
    ]
}
