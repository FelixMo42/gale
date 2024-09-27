import Quill from "quill"

export default function main() {
    const quill = new Quill("main", {
        modules: { toolbar: {
            container: [
                { 'header': 2 },
                'bold',
                'italic',
                'underline',
                'strike',
                { 'align': 'center' },
                'clean'
            ]
        },  },
        theme: "bubble"
    })

    // load contents
    quill.setContents(JSON.parse(localStorage.getItem("save")))

    // auto save
    quill.on("text-change", (_delta) => {
        const data = quill.getContents()
        const save = JSON.stringify(data)
        localStorage.setItem("save", save)
    })

    // open command pallet
    quill.keyboard.addBinding({
        key: "p",
        shortKey: true
    }, () => {
        alert(quill.getText().split(/\s/).length)
    })
}
