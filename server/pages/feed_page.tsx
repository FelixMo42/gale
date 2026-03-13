import { open, param, read } from "../utils/misc"
import { page } from "../utils/page"
import * as time from "../utils/time"
import { CalendarWidget, ProjectsWidget } from "../widgets"

import Parser from 'rss-parser'

interface FeedItem {
    title: string
    link: string
    author: string
    date: Date
    source: any
}

export async function feed_page(req: Request) {
    const feed = (await get_feed()).slice(0, 50)

    return page("diary", <>
        <aside>
            <CalendarWidget month={param(req, "m")} />
            <ProjectsWidget />
        </aside>
        <main class="col gap padh">
            <input type="search" placeholder="Search" class="sticky" />
            {feed.map(item =>
                <article class="row">
                    <div class="pad col gap flex" style={{
                        minWidth: "0px",
                    }}>
                        <a href={item.link} class="dot">{ item.title }</a>
                        <div class="row gap">
                            <div class="flex">{item.author}</div>
                            <div class="grey">{time.format_date_title(item.date)}</div>
                        </div>
                    </div>
                    <div style={{
                        aspectRatio: "1/1",
                        width: "78px",
                        borderLeft: "1px solid lightgray",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        fontSize: "1.5em",
                        color: "#72ff72",
                        cursor: "pointer",
                    }}>
                       <div>✓</div>
                    </div>
                </article>
            )}
        </main>
        <aside>
            <article
                class="editor"
                href="/fs/settings/rss.md"
                contenteditable="true"
            />
        </aside>
    </>)
}

const parser = new Parser()

async function refresh_feed() {
    const file = await read("/settings/rss.md")
    const urls = file
        .split("\n")
        .filter(line => line.startsWith("http") || line.startsWith("yt://"))
        .map(line => line.replaceAll("yt://", "https://www.youtube.com/feeds/videos.xml?channel_id="))
    const feed = await Promise.all(urls.map(u => parser.parseURL(u)))
    const items = feed
        .flatMap(feed => feed.items)
        .map(item => ({
            title: item.title,
            link: item.link,
            author: item.author ?? item.creator,
            date: new Date(item.pubDate!),
            source: item,
        } as FeedItem))
        .sort((a, b) => b.date.getTime() - a.date.getTime())

    await open("/settings/rss.json").write(JSON.stringify(items))
    return items
}

async function get_feed(): Promise<FeedItem[]> {
    const data = open("/settings/rss.json")
    if (await data.exists())
        return (await data.json()).map((item: FeedItem) => ({
            ...item,
            date: new Date(item.date),
        }))
    return refresh_feed()
}