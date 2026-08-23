// Escapes regex special characters so raw user input can't break `new RegExp(...)`
// e.g. if someone types "c++" or "1.5", those symbols mean something in regex syntax —
// this neutralizes them so they're treated as literal characters to search for.
export function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Matches if `query` is a prefix of ANY word inside `text`, not a substring anywhere.
// \b = word boundary — anchors the match to the start of a word, e.g.:
export function matchesSearch(text, query) {
    if (!query) return true; // empty search shows everything
    const pattern = new RegExp('\\b' + escapeRegExp(query), 'i'); // 'i' = case-insensitive
    return pattern.test(text);
}