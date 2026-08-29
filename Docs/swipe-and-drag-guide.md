# Swipe & Drag-Reorder — Feature Architecture

*How the gesture system works, and the real bugs that shaped it.*

---

## Why Pointer Events, not two separate APIs

Native HTML5 Drag-and-Drop (`draggable`, `dragstart`/`drop`) is desktop/mouse-only — it doesn't fire on touch. Since swipe is inherently a touch-first gesture, **both** swipe and drag-reorder are built on **Pointer Events** (`pointerdown`/`pointermove`/`pointerup`) instead — one API that unifies mouse, touch, and stylus, so the same code path handles every input device.

---

## The three gestures, and how they stay out of each other's way

| Trigger | File | What it does |
|---|---|---|
| `pointerdown` anywhere on the row body | `swipe.js` | Horizontal swipe → archive (left) / delete (right) |
| `pointerdown` on the `.drag-handle` (⠿ icon) | `reorder.js` | Vertical drag → reorder the list |
| Both attach to the SAME element: `dom.todoList` | — | Event delegation — one listener catches every row |

### The core conflict, and why `stopPropagation` doesn't fix it

`swipe.js` and `reorder.js` both call `dom.todoList.addEventListener('pointerdown', ...)`. Two **separate** listeners on the **same** element for the **same** event **both always fire** — `stopPropagation()` only affects events traveling *between* different elements (bubbling up the tree); it does nothing to a sibling listener registered on that same element.

**The fix:** `reorder.js`'s handler calls `e.stopImmediatePropagation()` — the one method that *does* suppress other listeners on the same element — the moment it confirms the pointerdown started on `.drag-handle`. This makes the two gestures mutually exclusive by construction:

```javascript
const handle = e.target.closest('.drag-handle');
if (!handle) return; // not the handle — let swipe.js's listener run normally
e.stopImmediatePropagation(); // IS the handle — swipe.js's listener never runs for this event
```

**Listener registration order matters here**: `initSwipeGestures()` must run *before* `initReorder()` in `main.js`. Listeners fire in registration order — if swipe's ran second, it would already be done acting by the time reorder's `stopImmediatePropagation()` executes, too late to matter.

### Swipe's own exclusion guard

```javascript
if (e.target.closest('button, input, .edit-input, .drag-handle')) return;
```
This keeps swipe from hijacking clicks on the checkbox, Edit/Delete/Restore/Archive buttons, the edit-mode text input, AND the drag handle. Every time a new interactive element type gets added to a todo row, it needs to be added to this exclusion list too — an easy thing to forget.

---

## Bugs hit while building this (and the underlying lesson each one teaches)

### 1. `NaN` id — `dataset` doesn't know about your data shape
Storing `id` only as a Map key (never inside the todo object) meant an old/incomplete stored object had no `id` field. `dataset.todoId` was set to `"undefined"` (string), `parseInt("undefined")` → `NaN`, and `Map.get(NaN)` found nothing.
**Lesson:** don't duplicate the same fact in two places (Map key AND object field) if one can always be derived from the other — derive `id` from `.entries()` fresh every render instead.

### 2. Dead code after an early `return`
```javascript
return localStorage.setItem('theme', ...);
updateThemeIcon(isDark); // never runs — anything after `return` is unreachable
```
**Lesson:** `return <expression>` still exits immediately — it doesn't "continue after computing the value." Any code after a `return` in the same function is simply dead.

### 3. Reference error from wrong variable-declaration order
```javascript
li.dataset.serial = serial; // ReferenceError: li is used before it's created
const li = document.createElement('li');
```
Because the function crashed here, but `save()` had *already run* before `render()` was called — so the data made it into `localStorage` while the screen stayed blank. **Lesson:** a "silent" failure downstream (blank UI) can have already-successful side effects upstream (saved data) — check both ends, don't assume "nothing changed" if the screen looks empty.

### 4. Transform drift during drag-reorder
```javascript
const deltaY = moveEvent.clientY - startY; // startY captured ONCE, at drag start
```
Every time the dragged item got moved to a new DOM slot (`insertBefore`), its actual on-screen position changed — but `deltaY` kept being measured against the *original* starting point, compounding error with every swap until the item flew far outside the list.
**Fix:** reset `startY` (and zero out the transform) every time the item's DOM position actually changes — its new slot IS its new correct position, so "distance traveled from here" restarts at zero.

### 5. `pointer-events: none` silently swallowing an entire feature
The `.drag-handle` inherited an old `.swipe-hint { pointer-events: none }` rule meant for when the icon was purely decorative. Once it became interactive, that old rule kept blocking every pointer interaction on it — no cursor change, no click, nothing — with zero errors anywhere, because from the browser's perspective the element simply wasn't there for pointer purposes.
**Lesson:** "nothing happens, no errors, cursor doesn't even change" is the specific signature of `pointer-events: none` — check that property first when an element seems completely unresponsive.

---

## Data-integrity rule for reordering

`reorder.js`'s `commitNewOrder()` rebuilds `state.todos` from **whatever `<li>` elements currently exist in the DOM**. This is only safe when **every** todo is visible — i.e., the "All" filter. If reordering were allowed while filtered to "Active" or "Completed", the hidden todos (not in the DOM) would be silently dropped from the rebuilt Map. This is why `handlePointerDown` in `reorder.js` bails out immediately unless `state.filterStatus === 'all'`.

---

## Serial numbers are render-order, not stored identity

```javascript
filtered.forEach((todo, index) => {
    const serial = index + 1; // recomputed fresh on every render
```
Numbers shown to the user (`1.`, `2.`, `3.`...) are **not** stored anywhere — they're derived from position in the current filtered/rendered list. This is why reordering "just works" for renumbering with zero extra code: change the order, re-render, the numbers naturally follow.
