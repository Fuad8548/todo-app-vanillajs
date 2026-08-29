# CSS — Reference Notes
*Distilled from building the Todo App's styling system (design tokens, dark mode, split files, flexbox gotchas)*

---

## 1. Design tokens via CSS Custom Properties (`var(--name)`)

```css
:root {
    --color-primary: #667eea;
    --spacing-md: 10px;
}

.button {
    background: var(--color-primary);
    padding: var(--spacing-md);
}
```
Every value that repeats across the file is defined **once** as a variable, then referenced everywhere. Change the value in one place (`:root`), and every rule using it updates automatically — no find-and-replace across hundreds of lines.

### The payoff: theming becomes "redefine the same variable names"

```css
body.dark-mode {
    --color-bg: #1e1e2e;      /* overrides the light-mode value, ONLY inside body.dark-mode */
    --color-gray-light: #2a2a3d;
}
```
Because every other rule in the file already reads `var(--color-bg)` rather than a hardcoded color, adding an entire dark theme required **zero changes** to any of those existing rules — just one new block redefining the same variable names under a different selector. This is the core reason to reach for variables: it turns "add a feature that touches everything" into "add one small override block."

**Gotcha:** a variable override only applies *within the selector it's declared on* and its descendants (CSS custom properties inherit down the tree). `body.dark-mode { --color-bg: ...; }` works because `.container` (which uses `var(--color-bg)`) is a descendant of `body`.

---

## 2. Splitting one stylesheet into multiple files — load order matters

```html
<link rel="stylesheet" href="css/tokens.css">   <!-- variables MUST come first -->
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/buttons.css">
<link rel="stylesheet" href="css/responsive.css"> <!-- media-query overrides LAST -->
```
CSS is applied top-to-bottom, in the order files are linked. Two ordering rules matter:
1. **Anything defining `var(--...)` values must load before anything that uses them.**
2. **Override rules (like a responsive/media-query file) should load last**, so they win ties against earlier rules of equal specificity.

**Why separate `<link>` tags instead of one file with `@import`:** `@import` loads files *serially* (each one blocks the next from starting). Separate `<link>` tags let the browser fetch all of them *in parallel* — faster, and each file stays independently reviewable.

**Gotcha discovered the hard way:** adding a new CSS file (e.g. `toast.css`) does nothing until you add its own `<link>` tag in the HTML — the file existing on disk isn't enough. Symptom: an element renders as totally unstyled default browser markup (e.g. plain black text in the document flow) — that's usually a missing `<link>`, not a JS bug.

---

## 3. The `*` universal reset can silently undo browser defaults you were relying on

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```
This is standard practice — but it's aggressive. Native elements sometimes ship their *own* useful default styling that this reset wipes out without you noticing. Example: the `<dialog>` element auto-centers itself via a built-in `margin: auto`. The `* { margin: 0 }` reset overrides that silently, so a `<dialog>` snaps to the top-left corner instead of centering — with nothing in your own code appearing to be "wrong." **Lesson:** if a native/semantic HTML element behaves unexpectedly, check whether your global reset is fighting a default you didn't know you were relying on.

---

## 4. Flexbox's hidden `min-width: auto` — the shrink-refusal gotcha

```css
.filter-buttons {
    display: flex;
}
.filter-btn {
    flex: 1; /* "share space equally" — but this alone doesn't guarantee it can shrink enough */
}
```
Flex items have a **default `min-width: auto`**, meaning a flex item refuses to shrink smaller than its own content's natural width — even with `flex: 1` telling it to share space. Add a 4th button to a row that used to fit 3, and if there isn't enough room, items **overflow their container** instead of compressing, because each one is silently refusing to shrink past its content size.

**Fix:**
```css
.filter-btn {
    flex: 1;
    min-width: 0; /* explicitly allows shrinking below content size */
}
```

---

## 5. `cursor` styling as a UX affordance, not decoration

```css
.drag-handle {
    cursor: grab;        /* open hand — "you can pick this up" */
}
.dragging {
    cursor: grabbing;    /* closed hand — "currently held" */
}
.todo-item {
    cursor: ew-resize;   /* left-right arrows — "this moves horizontally" */
}
```
Different cursor shapes communicate different interaction types **before the user even touches anything** — this matters most on desktop, where touch users don't see a cursor at all, but it's a strong, free signal for mouse users. A cursor that never changes on hover over an element that's supposed to be interactive is a strong sign of `pointer-events: none` blocking it (see the DOM notes file for that gotcha).

**Cascade note:** children with their *own* explicit `cursor` rule (e.g. a `<button>` inside a row that has `cursor: ew-resize`) keep their own cursor — `cursor` only inherits down to descendants that *don't* set it themselves.

---

## 6. Feedback states without fighting JS-driven inline styles

```css
.todo-item:active {
    filter: brightness(0.97); /* NOT transform: scale(...) */
}
```
If JavaScript sets `element.style.transform = ...` directly for some other purpose (e.g. a swipe gesture tracking the cursor), a CSS `:active` rule using `transform` for a "pressed" effect would conflict with it — inline styles set via JS take precedence and can stomp on the CSS rule, or fight it visually. Using a different property (`filter`, `box-shadow`, `background`) for unrelated visual feedback avoids the collision entirely.

---

## 7. Transitions vs. explicit "wait for it to finish" logic

```css
.todo-item {
    transition: var(--transition); /* e.g. all 0.3s ease */
}
```
```javascript
element.style.transform = 'translateX(500px)'; // triggers the CSS transition above
element.addEventListener('transitionend', () => {
    // runs exactly when the animation visually finishes — not before
}, { once: true });
```
Reusing a transition **already defined in CSS** for a state-changing style update from JS means you don't need any separate animation code — just change the property, and `transitionend` tells you precisely when it's done. Useful whenever an action (like deleting an item) needs to happen only *after* something finishes animating away, not immediately when the delete is triggered.

---

## Quick mental-model glossary

| Term | One-line meaning |
|---|---|
| CSS Custom Property (`--name`) | A variable, referenced via `var(--name)`, inherited down the DOM tree |
| Cascade order | Later `<link>`/rules of equal specificity beat earlier ones |
| `min-width: auto` (flex default) | Why `flex: 1` items can still refuse to shrink — override with `min-width: 0` |
| `pointer-events: none` | Makes an element invisible to clicks/hover/cursor changes entirely |
| `cursor` inheritance | Only inherits to children that don't set their own `cursor` |
| `transitionend` | Fires exactly when a CSS transition finishes — useful for sequencing JS after an animation |
