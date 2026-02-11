import { cb } from "./utils/api";
import * as time from "./utils/time.ts"
import BeeperDesktop from '@beeper/desktop-api'

// export const client = new BeeperDesktop()

interface InboxItem {
    title: string,
    url: string,
}

export const get_inbox = cb(async () => {
    const inbox: InboxItem[] = []

    // for await (const chat of await client.chats.search({
    //     lastActivityAfter: time.yesterday().toISOString(),
    //     inbox: "primary",
    // })) inbox.push({
    //     title: chat.title!,
    //     url: `/chat/${chat.id}`,
    // })

    return <>
        {inbox.map(item =>
            <div class="flex bb pad row">
                <div class="flex"><a href={item.url}>{item.title}</a></div>
                <input type="checkbox" />
            </div>
        )}
    </>
})
