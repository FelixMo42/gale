window.onload = () => {
    // make a's active is the point to the current page
    document
        .querySelectorAll("a")
        .forEach((link) => {
            const linkPath = new URL(link.href, window.location.origin).pathname
            const currentPath = window.location.pathname

            if (linkPath === currentPath) {
                link.classList.add('active')
            }
        })

    // attach editors
    document
        .querySelectorAll("article.editor[href]")
        .forEach(attach_editor)

    // popup
    const modal = document.querySelector("dialog")
    const input = document.querySelector("dialog input")
    input.oninput = () => search(input.value)
    input.onfocus = () => search(input.value)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.close()
    })
    document.addEventListener('keydown', function (event) {
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
}

async function search(q="") {
    const html = await fetch(`/api/search?q=${q}`).then(r => r.text())
    document.getElementById("results").innerHTML = html
}

function attach_editor(editor) {
    const path = editor.getAttribute("href")

    // Fetch the content of the daily note
    fetch(path, { cache: "no-cache" })
        .then(response => response.status == 200 ? response.text() : "")
        .then(text => editor.innerHTML = md_to_html(text))
        .then(() => {
            editor
                .querySelectorAll(".indent")
                .forEach((element) => {
                    element.parentElement.style.paddingLeft = `${element.scrollWidth}px`
                    element.parentElement.style.textIndent = `-${element.scrollWidth}px`
                })
        })

    // Save on edit 
    editor.oninput = () => {
        update_editor(editor)
        const body = html_to_md(editor)
        fetch(path, { method: "POST", body })
    }
}

function update_editor(editor) {
    editor.childNodes.forEach(line => {
        if (line.nodeType === line.ELEMENT_NODE) {
            line.className = get_line_class(line.innerText)
        }
    })

    editor
        .querySelectorAll("indent")
        .forEach((element) => {
            element.parent.style.paddingLeft = element.width
        })

}

function get_line_class(line) {
    if (line.startsWith("# ")) return "h1"
    if (line.startsWith("## ")) return "h2"
    return ""
}

function md_to_html(md) {
    return md.split("\n").map(line => {
        if (line === "") return "<div><br></div>"
        return `<div class="${get_line_class(line)}">${$(line)}</div>`
    }).join("")

    function $(line) {
        return match_replace(line, [
            [/\*[^\*]*\*/g, g => `<i>${g}</i>`],
            [/\_[^\_]*\_/g, g => `<i>${g}</i>`],

            [/\*\*[^\*]*\*\*/g, g => `<b>${g}</b>`],
            [/\_\_[^\_]*\_\_/g, g => `<b>${g}</b>`],

            [/\~\~.*\~\~/g, g => `<span class="strike">${g}</span>`],

            [/^\s*\√\s+/g, g => `<span class="task indent">${g}</span>`],
            [/^\s*\_\s+/g, g => `<span class="task indent">${g}</span>`],

            [/^\s*\-\s+/g, g => `<span class="indent">${g}</span>`],
            [/^\s*\*\s+/g, g => `<span class="indent">${g}</span>`],
            [/^\s*\>\s+/g, g => `<span class="indent">${g}</span>`],

            [/\[\[[^\]]+\]\]/g, g => `<a onclick="document.location='/${format_link(g)}'">${g}</a>`],
        ])
    }
}

function format_link(name) {
    return name
        .replaceAll("[[", "")
        .replaceAll("]]", "")
        .replaceAll(" ", "_")
        .toLowerCase()
}

function html_to_md(html) {
    return [...html.childNodes].map(node => {
        if (node.nodeType == node.TEXT_NODE) return node.textContent
        if (node.innerText === "\n") return ""
        return node.innerText
    }).join("\n")
}

function match_replace(line, patterns) {
    for (const pattern of patterns) {
        const matches = line.match(pattern[0])
        if (matches) {
            for (const match of matches) {
                line = line.replaceAll(match, pattern[1](match))
            }
        }
    }

    return line
}
