// Entrance animation for a newly added <li> — fire-and-forget, nothing waits on this
export function animateIn(el) {
    el.animate(
        [
            { opacity: 0, transform: 'translateY(-8px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 2000, easing: 'ease-in-out' }
    );
}

// Exit animation for an <li> about to be deleted.
// Returns a Promise (`.finished`) so the caller can AWAIT it before
// actually deleting the data — otherwise the element vanishes mid-animation.
export function animateOut(el) {
    const animation = el.animate(
        [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-8px)' }
        ],
        { duration: 200, easing: 'ease-in' }
    );
    return animation.finished;
}