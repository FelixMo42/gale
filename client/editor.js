this.addEventListener("load", () => {
    // attach editors
    document.querySelectorAll('.editor').forEach(editor => {
        attach_editor(editor)
    })

    // make a's active is the point to the current page
    document
        .querySelectorAll("a")
        .forEach((link) => {
            const linkPath = new URL(link.href, this.location.origin).pathname
            const currentPath = this.location.pathname

            if (linkPath === currentPath) {
                link.classList.add('active')
            }
        })
})

function attach_editor(editor) {
    fetch(editor.getAttribute("href"), { cache: "no-cache" })
        .then(response => response.status == 200 ? response.text() : "")
        .then(text => editor.replaceChildren(...text
            .split("\n")
            .map(create_line_el)
        ))
        .then(() => {
            if (editor.onload) editor.onload()
        })

    editor.addEventListener('keydown', (event) => {
        const edit = key_to_edit(editor, format_key(event))
        if (edit) register_edit(editor, edit, event)
    })

    editor.addEventListener('paste', function(event) {
        const area = get_area(editor)
        const text = event.clipboardData.getData('text/plain')
        const edit = replace(editor, area, text)
        register_edit(editor, edit, event)
    })
}

function register_edit(editor, edit, event) {
    event.preventDefault()
    if (format_key(event) != "[cmd]z") add_undo_event(edit)
    editor.value = get_editor_text(editor)
    fetch(editor.getAttribute("href"), { method: "POST", body: editor.value })
    if (editor.postedit) editor.postedit(edit, event)
}

function get_editor_text(html) {
    return [...html.childNodes].map(node => {
        if (node.nodeType == node.TEXT_NODE) return node.textContent
        if (node.innerText === "\n") return ""
        return node.innerText
    }).join("\n")
}

function format_key(event) {
    return [
        event.metaKey ? "[cmd]" : "",
        (event.metaKey && event.shiftKey) ? "[shift]" : "",
        event.key,
    ].join("")
}

const undos = []
const redos = []

function add_undo_event(edit) {
    const can_merge_new = (
        undos.length > 0 &&
        !edit.old &&
        !undos.at(-1).old &&
        edit.area[0] == undos.at(-1).area[0] + undos.at(-1).new.length
    )

    const can_merge_old = (
        undos.length > 0 &&
        !edit.new &&
        !undos.at(-1).new &&
        edit.area[1] == undos.at(-1).area[0]
    )

    if (can_merge_new) {
        undos.at(-1).new += edit.new
    } else if (can_merge_old) {
        undos.at(-1).old = edit.old + undos.at(-1).old
        undos.at(-1).area[0] = edit.area[0]
    } else {
        undos.push(edit)
    }
}

function key_to_edit(editor, key) {
    const area = get_area(editor)

    if (key === "Backspace") {
        if (area[0] == area[1]) {
            if (area[0] > 0) {
                return replace(editor, [area[0] - 1, area[0]], "")
            }
        } else {
            return replace(editor, area, "")
        }
    } else if (key === "Enter") {
        return replace(editor, area, "\n")
    } else if (key.length === 1) {
        return replace(editor, area, event.key)
    } else if (key == "[cmd]z") {
        if (undos.length) {
            const edit = undo(editor, undos.pop())
            redos.push(edit)
            return edit
        }
    } else if (key == "[cmd][shift]z") {
        if (redos.length) {
            return undo(editor, redos.pop())
        }
    }
}

function undo(editor, edit) {
    return replace(editor,
        [edit.area[0], edit.area[0] + edit.new.length ?? 0],
        edit.old ?? "",
    ) 
}

function line_to_html(line) {
    if (line.length == 0) return "<br>"

    return match_replace(line, [
        [/\*[^\*]*\*/g, g => `<i>${g}</i>`],
        [/\_[^\_]*\_/g, g => `<i>${g}</i>`],

        [/\*\*[^\*]*\*\*/g, g => `<b>${g}</b>`],
        [/\_\_[^\_]*\_\_/g, g => `<b>${g}</b>`],
        [/\=\=[^\=]*\=\=/g, g => `<span class="highlight">${g}</span>`],

        [/\~\~.*\~\~/g, g => `<span class="strike">${g}</span>`],

        [/^\s*\√\s+/g, g => `<span class="indent task done">${g}</span>`],
        [/^\s*\_\s+/g, g => `<span class="indent task todo">${g}</span>`],
        [/^\s*\~\s+/g, g => `<span class="indent task work">${g}</span>`],
        [/^\s*\X\s+/g, g => `<span class="indent task stop">${g}</span>`],

        [/^\s*\-\s+/g, g => `<span class="indent">${g}</span>`],
        [/^\s*\*\s+/g, g => `<span class="indent">${g}</span>`],
        [/^\s*\>\s+/g, g => `<span class="indent">${g}</span>`],
        [/^\s*[\d]+\.\s+/g, g => `<span class="indent">${g}</span>`],

        [/\[\[[^\]]+\]\]/g, g => `<a onclick="document.location='/${format_link(g)}'">${g}</a>`],
    ])
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

function get_document_fragment_text(frag) {
    if (frag.childNodes?.[0]?.tagName === "DIV") {
        return [...frag.childNodes]
            .map((child) => child.textContent)
            .join("\n")
    }

    return frag.textContent
}

function replace(editor, area, text) {
    if (editor.preedit) {
        [ area, text ] = editor.preedit(area, text)    
    }

    const edit = { area, new: text }

    // delete old text in the range
    if (area[0] != area[1]) {
        const range = area_to_range(editor, area)

        const a = get_parent_div(range.startContainer)
        const b = get_parent_div(range.endContainer)

        const frag = range.extractContents()
        
        edit.old = get_document_fragment_text(frag)

        const accross_lines = a != b

        if (accross_lines) {
            a.appendChild(...b.childNodes)
            b.remove()
        }
    }

    const range = area_to_range(editor, [area[0], area[0]])

    // insert the text, if any
    if (text) {
        const el = document.createTextNode(text)
        range.insertNode(el)
    }

    const line_el = get_parent_div(range.startContainer)
    
    line_el.textContent
        .split("\n")
        .map(line => create_line_el(line))
        .forEach(el => line_el.parentNode.insertBefore(el, line_el))
    
    line_el.remove()

    // move caret to the right place
    const caret = area[0] + text.length
    const selection = this.getSelection()
    selection.removeAllRanges()
    selection.addRange(area_to_range(editor, [caret, caret]))

    return edit
}

function area_to_range(editor, area) {
    const range = document.createRange()
    let start = true

    walk(editor, (node, index) => {
        // check start position
        if (start && area[0] <= (index + node.textContent.length)) {
            start = false
            range.setStart(node, area[0] - index)
        }

        // check end position
        if (!start && area[1] <= (index + node.textContent.length)) {
            range.setEnd(node, area[1] - index)
            return true
        }
    })

    return range
}

function get_caret_range() {
    try {
        return this.getSelection().getRangeAt(0)
    } catch {
        return undefined
    }
}

function get_area(editor) {
    const range = get_caret_range()
    if (!range) return undefined

    const area = [0, 0]
    let start = true

    walk(editor, (node, index) => {
        // check start position
        if (start && node === range.startContainer) {
            area[0] = index + range.startOffset
            start = false
        }

        // check end position
        if (!start && node === range.endContainer) {
            area[1] = index + range.endOffset
            return true
        }
    })

    return area
}

function walk(editor, fn, index=-1) {
    const walker = document.createTreeWalker(editor)
    while (walker.nextNode()) {
        if (walker.currentNode.nodeName === "#text") {
            if (fn(walker.currentNode, index)) return
            index += walker.currentNode.textContent.length
        } else if (walker.currentNode.tagName === "DIV") {
            index += 1

            if (walker.currentNode.innerHTML === "<br>") {
                if (fn(walker.currentNode, index)) return
            }
        }
    }
}

function get_parent_div(element) {
    if (element.tagName === "DIV") {
        return element
    } else {
        return get_parent_div(element.parentElement)
    }
}

function create_line_el(text) {
    const el = document.createElement("DIV")
    el.className = get_line_class(text)
    el.innerHTML = line_to_html(text)
    
    requestAnimationFrame(() => {
        if (el.childNodes?.[0]?.classList?.contains("indent")) {
            el.style.paddingLeft = `${el.childNodes[0].scrollWidth}px`
            el.style.textIndent = `-${el.childNodes[0].scrollWidth}px`
        }
    })

    // el.querySelectorAll(".indent").forEach((element) => {
    // })

    return el
}

function get_line_class(line) {
    if (line.startsWith("# ")) return "h1 line"
    if (line.startsWith("## ")) return "h2 line"
    return "line"
}

function format_link(name) {
    return name
        .replaceAll("[[", "")
        .replaceAll("]]", "")
        .replaceAll(" ", "_")
        .toLowerCase()
}
