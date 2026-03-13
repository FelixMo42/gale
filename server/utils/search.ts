interface SearchQuery {
    mode: string
    words: string[]
    tags: { [key: string]: string }
}

function query(q: string | SearchQuery) {
    
}
