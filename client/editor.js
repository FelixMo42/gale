window.addEventListener("load", () => {
    // attach editors
    document.querySelectorAll('.editor').forEach(editor => {
        attach_editor(editor)
    })

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
})

function attach_editor(editor) {
    const path = editor.getAttribute("href")

    // fetch the content of the linked note
    fetch(path, { cache: "no-cache" })
        .then(response => response.status == 200 ? response.text() : "")
        .then(text => editor.innerHTML = text
            .split("\n")
            .map((line) => `<div>${line}</div>`)
            .join("")
        )
        .then(() => format(editor))

    // reformat & save on edit
    editor.addEventListener('input', () => {
        format(editor)

        const body = get_editor_text(editor)
        fetch(path, { method: "POST", body })
    })
}

function get_editor_text(html) {
    return [...html.childNodes].map(node => {
        if (node.nodeType == node.TEXT_NODE) return node.textContent
        if (node.innerText === "\n") return ""
        return node.innerText
    }).join("\n")
}

function get_parent_div(element) {
    if (element.tagName === "DIV") {
        return element
    } else {
        return get_parent_div(element.parentElement)
    }
}

function save_caret() {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return () => {}

    const range = selection.getRangeAt(0)
    const parent = get_parent_div(range.startContainer)
    const offset_range = document.createRange()
    offset_range.setStart(parent, 0)
    offset_range.setEnd(range.endContainer, range.endOffset)
    const offset = offset_range.toString().length

    return function restore_caret() {
        const walker = document.createTreeWalker(
            parent,
            NodeFilter.SHOW_TEXT
        )

        let position = 0;
        let node;
        while (node = walker.nextNode()) {
            if (position + node.textContent.length >= offset) {
                const new_range = document.createRange()
                new_range.setStart(node, offset - position)
                new_range.collapse(true)

                selection.removeAllRanges()
                selection.addRange(new_range)

                return
            } else {
                position += node.textContent.length
            }
        }
    }
}

function line_to_html(line) {
    if (line.trim().length === 0) return "<br>"

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

function get_line_class(line) {
    if (line.startsWith("# ")) return "h1"
    if (line.startsWith("## ")) return "h2"
    return ""
}

function format(editor) {
    const restore_caret = save_caret(editor)

    const lines = editor.querySelectorAll("div")
    if (lines.length === 0) {
        editor.innerHTML = line_to_html(editor.textContent)
        editor.firstChild.className = get_line_class(node.textContent)
    } else {
        lines.forEach(node => {
            node.innerHTML = line_to_html(node.textContent)
            node.className = get_line_class(node.textContent)
            node.style = ""
        })
    }
    
    restore_caret()

    editor.querySelectorAll(".indent").forEach((element) => {
        element.parentElement.style.paddingLeft = `${element.scrollWidth}px`
        element.parentElement.style.textIndent = `-${element.scrollWidth}px`
    })
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

function format_link(name) {
    return name
        .replaceAll("[[", "")
        .replaceAll("]]", "")
        .replaceAll(" ", "_")
        .toLowerCase()
}
