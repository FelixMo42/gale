import * as esbuild from "esbuild"

export async function main() {
    const ctx = await esbuild.context({
        entryPoints: [ "src/main.tsx" ],
        outfile: "out/index.js",
        platform: "browser",
        format: "esm",
        bundle: true,
        jsxFactory: 'm',
    })

    const { host, port } = await ctx.serve({ servedir: "." })
    console.log(`Running on http://${host}:${port}`)

    ctx.watch()
}

main()