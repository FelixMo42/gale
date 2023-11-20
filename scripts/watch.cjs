const fs = require("fs/promises")
const build = require("./build.cjs")

async function main() {
    build()

    const events = fs.watch("./src/", { recursive: true })

    for await (const _event of events) {
        console.log("rebuilding...")
        build()
    }
}

module.exports = main

if (require.main === module) {
    main()
}