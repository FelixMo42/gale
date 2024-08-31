import Quill from "quill"

export default function main() {
    const quill = new Quill("#root", {
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

    quill.setContents(JSON.parse(localStorage.getItem("save")))

    quill.on("text-change", (_delta) => {
        const data = quill.getContents()
        const save = JSON.stringify(data)
        localStorage.setItem("save", save)
    })
}
