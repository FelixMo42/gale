window.onload = () => {
    document
        .querySelectorAll("section.editor[href]")
        .forEach(attach_editor)
}

function attach_editor(editor) {
    const path = editor.getAttribute("href")

    // Fetch the content of the daily note
    fetch(path, { cache: "no-cache" })
        .then(response => response.status == 200 ? response.text() : "")
        .then(text => editor.innerHTML = md_to_html(text))

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
            [/\*\*[^\*]*\*\*/g, g => `<b>${g}</b>`],

            [/\*[^\*]*\*/g, g => `<i>${g}</i>`],
            [/\_[^\_]*\_/g, g => `<i>${g}</i>`],
            
            [/\~\~.*\~\~/g, g => `<span class="strike">${g}</span>`],
        ])
    }
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
