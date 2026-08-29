<div align="center">
  <b>A todo app to learn vanilla.js</b>
</div>

## Browser API
  - **DOM API**: A programming interface to manipulate HTML elements, their styles, and attributes.
  - **Storage API**: to store data locally on the user’s device.

## Web API
- ### Getting Element Object:
  - **getElementById()**: We can get an object that represents the HTML element with the specified id. Ids must be unique in every HTML document.
  - **querySelector()**: With it, we can get the first element in the HTML document that matches the CSS selector passed as argument.
    - **querySelectorAll()**: 
      - to match all elements of a specific type:
        ```javascript 
        document.querySelectorAll("div");
        ```
      - All elements with a specific class:
        ```javascript 
        document.querySelectorAll(".todoList");
        ```
      - All elements with a specific ID:
        ```javascript 
        document.querySelectorAll("#todoList");
        ```
      - matches all list items within an unordered list element and assign the return value to the unordered constant:
        ```javascript 
        const unorderedTodo = document.querySelectorAll("ul.unordered li");
        ```
        This will return a collection of nodes as NodeList(). We can work with this collection exactly like any JS array. i.e., ```unorderedTodo.length```; iteration: 

        ```javascript 
        for (let i = 0; i < matches.length; i++) {
            console.log(matches[i]);    
        } 
        ```          
      - All elements with a specific attribute, like all links that take users to a specific URL: 
        ```document.querySelectorAll("a[href='https://www.example.com/']");```

- ### Creating Element Object:
  - **innerHTML**: It is a property of Element objects that we can use to set their HTML markup with a string. Then, we set the `innerHTML` property of the container to a string: 

  ```Javascript
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "<li style='text-align: center; color: #999; padding: 20px;'>No todos found</li>";
  ```
  Though `innerHTML` is helpful, it has some security issues if a user enter a string of malicious contents. So, `textContent` is recommended to insert plain text. 
  - **createElement()**: Another way to create new node by specifying its tag name:
    ```javascript 
    const li = document.createElement('li');
    ```
  - **innerText**: This property only returns the text that is visible irrespective of the hidden child element.i.e., ```todoList.innerText```

  - **textContent**: This property includes all indentation, whitespaces of a text regardless of whether it is visible or hidden.
    ```javascript
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "<li style='text-align: center;'>    No todos found</li>";
    console.log(todoList.innerText); //No todos found
    console.log(todoList.textContent); //    No todos found
    ```
    **Let's have a look at quick differences among innerHTML, innerText and textContent:**
    |  Property   |           Returns           | Aware of CSS/visibility? |        Includes HTML tags?         |                          Performance                           |
    | :---------: | :-------------------------: | :----------------------: | :--------------------------------: | :------------------------------------------------------------: |
    | textContent | All text (including hidden) |           ❌ No           |                ❌ No                |                        Fast (no reflow)                        |
    |  innerText  |      Only visible text      |          ✅ Yes           |                ❌ No                | Slower (triggers reflow, since it must compute what's visible) |
    |  innerHTML  |       Raw HTML string       |           ❌ No           | ✅ (XSS risk on untrusted input)Yes |                            Moderate                            |

    ```html
    <div id="box">
      Hello <span style="display:none">Hidden</span> <b>World</b>
    </div>  
    ```
    ```javascript
    const box = document.getElementById('box');

    console.log(box.textContent);
    // "Hello Hidden World"  → gets ALL text, including hidden elements, ignores styling

    console.log(box.innerText);
    // "Hello World"  → gets only VISIBLE text, respects CSS (display:none skipped)

    console.log(box.innerHTML);
    // "Hello <span style="display:none">Hidden</span> <b>World</b>"  → gets the actual HTML markup as a string
    ```

    **Rule of thumb:** default to `textContent` for reading/writing plain text. Never pipe untrusted/user input into `innerHTML` directly — sanitize first (see `escapeHTML` pattern below).

    ```javascript
    // Safe escaping pattern used in the todo app:
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;   // browser escapes it for us
        return div.innerHTML;     // read back the escaped string
    }
    ```

- ### Adding to and removing nodes from DOM
  - **appendChild()**: This method is used to add a node to the end of the list of children of a specified parent node.
    ```javascript
    todoList.appendChild(li);
    ```
  - **removeChild()**: To remove a node from the DOM

---

## Dynamically update attributes of HTML element
  **Attributes vs. Properties**
  Two *separate storage locations* on any DOM element:
  - **Attribute** = string, lives in the HTML markup (`getAttribute`/`setAttribute`)
  - **Property** = live JS object value, can be any type (`element.value`, `element.id`, etc.)

  - **`setAttribute(name, value)`**: Sets the value of an attribute on a DOM element. Changing the attribute (`setAttribute()`) updates the default value. It will only update the screen if the user or a script hasn't modified the live property yet. If the attribute already exists, it updates it; if not, it creates it.

  - **`getAttribute("value")`** interacts with the HTML attribute in the DOM markup. It defines the default or initial value of the input field.
    - Values are always strings, not number:
      ```javascript
      btn.setAttribute('data-count', 5);
      console.log(btn.getAttribute('data-count')); // "5" 
      ```

  - `element.value` interacts with the JavaScript *property*. It represents the current live value typed by the user or changed via script. It never updates the HTML attribute

      ```javascript
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('value', 'foo');
      input.value = 'bar';
      console.log(input.getAttribute('value')); // "foo"
      console.log(input.value);                 // "bar"
      ```

  **Python anchor:** reflected properties ≈ `@property`/`@x.setter` sitting on top of a backing field — except the browser writes this getter/setter for you.

---

## Events: objects, listeners, delegation
  When the user clicks on a button or there is a change in a form, this is known as an event. In our programs, we will need to have a way to listen for these events and respond to them.
  - ### Adding/ removing listeners
    - **addEventListener()**: This method is used to listen for events. It takes two arguments: the event we want to listen for and a function that will be called when the event occurs.
      ```javascript
      element.addEventListener("event", listener);
      ```
      For example, we have a ```button``` element with the id   ```btn```: 
      ```html
      <button id="btn">Add Todo</button>
      <input type="text" id="input" placeholder="Type something" />
      ```
      ```javascript
      const btn = document.getElementById("btn");
      const input = document.getElementById("input");

      const handleClick = () => {
      	console.log("button clicked");
      };

      const handleInput = (e) => {
          console.log("Input Value:", e.target.value);
      };

      btn.addEventListener("click", handleClick);
      btn.addEventListener("click", handleClick());
      input.addEventListener("input", handleInput);
      input.addEventListener("input", handleInput());  // TypeError

      btn.removeEventListener('click', handleClick);
      ```
      [**Difference bw function reference and function call:**
      - Passing the Reference `handleClick` and `handleInput` runs only when the click and input events fire. 
      - Calling the Function: `handleClick()` runs instantly when the page loads, before any click happens (That's why you will see "button clicked" immediately after page loads). `handleInput()` will throw `TypeError` as it expects the value when page loads but found nothing!]

    - **removeEventListener()**: To remove an event listener this method is called. It is significant while logging out of a user and removing session history. Otherwise, 
      - **Memory leakage**:  as long as a listener is attached to document/ window (which never get garbage collected on their own), the function it references -- stays alive in memory foreever, even after the user is gone. 
        ```javascript
        function loginUser(userId) {
            function autoSave(e) { saveToServer(userId, e.target.value); } // closes over userId
            input.addEventListener('input', autoSave);
            session.autoSave = autoSave; // stash reference for later removal
        }
        function logoutUser() {
            input.removeEventListener('input', session.autoSave);
        }
        ```
        [if a handler reads from a shared `state` object fresh every time (like the todo app's `handleTodoAction`) instead of closing over per-user data, you often *don't* need to remove/re-add it — just reset `state` itself.]
        however, React ```useEffect()``` do this under the hood: 
        ```javascript
          useEffect(() => {
            window.addEventListener('mousemove', handleAction);

            // Return a cleanup function
            return () => {
              window.removeEventListener('mousemove', handleAction);
            };
          }, [isLoggedIn]);
        ```

  - ### The event object
    ```javascript
    btn.addEventListener('click', function(event) {
    	console.log(event.target);         // exact element that triggered it (could be a child)
    	console.log(event.currentTarget);  // element the listener is attached to (never changes)
    	console.log(event.type);            // "click"
    	console.log(event.stopPropagation());  // stop bubbling further up the DOM
    	console.log(event.preventDefault());   // stop default browser action (e.g. form submit/reload)
    });
    ```

  - ### Bubbling: `stopPropagation()` & `stopImmediatePropagation()`
    Events fire on the target, then **bubble up** through every ancestor with a listener. Use `stopPropagation()` when a nested control (e.g. a delete button inside a clickable card) shouldn't also trigger the parent's handler.

    ```html
    <div class="card"> Hello!
      <button class = "btn">
        click me!
      </button>
    </div>
    ```
    ```javascript
    // The parent container 
    const card = document.querySelector('.card'); 
    card.addEventListener('click', () => { 
      console.log('Card clicked!'); 
    }); 

    // The nested child button 
    const btn = document.querySelector('.btn'); 
    btn.addEventListener('click', (event) => { 
      // Stop the event from bubbling up to the card 
      event.stopPropagation();
      console.log('Button clicked!');
    });
    ```
    If you click the button it will log only "Button clicked!" in the console. But if you commment out ```event.stopPropagation()``` both texts will be logged. That means not only button but also it's parent will be clicked. The browser doesn't just fire listeners on the button; it fires the event in phases, going down then back up the DOM tree:

    1. **CAPTURE phase**: `window` → `document` → `.card` → `.btn`  (top-down)
    2. **TARGET phase**: fires on `.btn` itself
    3. **BUBBLE phase**: `.btn` → `.card` → `document` → `window` (bottom-up, this is the default)
    Our listeners are both in the default bubble phase. So clicking the button:
    4. Fires on `.btn` → logs "Button clicked"
    5. Then bubbles up to `.card`, which also has a click listener → logs "Card container clicked!"
    - **Real-world example**: a card that's clickable to "open details," but has a delete button (X) inside it.
    - **Without `stopPropagation()`**: clicking the delete button also triggers "open details" — because the click bubbled up to the card's listener too. That's a bug.

    **Multiple listeners on the SAME element for the SAME event — `stopPropagation` does NOT stop siblings**:
    ```javascript
    el.addEventListener('pointerdown', handlerA);
    el.addEventListener('pointerdown', handlerB);
    // BOTH always run on every pointerdown — stopPropagation() only affects events traveling between DIFFERENT elements (bubbling up the tree), not sibling listeners on the SAME element.
    ```
    To make one handler suppress a sibling handler on the same element, use `stopImmediatePropagation()` instead — and remember **listener registration order matters**: it can only suppress listeners registered *after* it, not ones that already ran.
    ```javascript
    function handlerB(e) {
        if (!shouldHandleThis(e)) return; // let handlerA run normally
        e.stopImmediatePropagation();     // guarantees handlerA never runs for this event
        // ...
    }
    ```

  - **preventDefault()**: Stops reloading the page during form submission.
    ```javascript
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Form intercepted');
    });
    ```

  - ### Event delegation — ONE listener instead of many
    Instead of attaching a listener to every ``<li>``, attach one to the parent and inspect event.target:
    ```javascript
    document.querySelector('#list').addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        console.log('You clicked:', e.target.textContent);
      }
    });
    ```
    Works automatically for elements added **later** (dynamically rendered), since the listener lives on the stable parent, not on each child.
    
  - ### `closest()` and `dataset` — the backbone of delegation

    ```javascript
      // closest(selector): walks UP from the clicked element until it finds a match, or null
      const todoItem = event.target.closest('.todo-item');
      if (!todoItem) return; // guard against clicks outside any todo item
       
      // dataset: reads data-* HTML attributes, auto-camelCased, ALWAYS returns strings
      // <li data-todo-id="123"> -> todoItem.dataset.todoId === "123" (string!)
      const id = parseInt(todoItem.dataset.todoId); // MUST convert — Map keys are type-sensitive
    ```
    ⚠️ **Real bug this caused:** storing `id` only as a Map key (never inside the todo object) meant a stale/incomplete stored object had no `id` field, `dataset.todoId` became `"undefined"`, and `parseInt` gave `NaN`. **Fix:** derive `id` from the Map key via `.entries()` every render, never trust a duplicated copy of it.

---

## Array vs. `Map` — when the upgrade is worth it
    
    | Operation         | Array                                           | Map                                                                              |
    | ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
    | Add               | `.push()` — O(1)                                | `.set(key, val)` — O(1)                                                          |
    | Find/update by id | `.find()`/`.map()` — **O(n)**, scans everything | `.get(key)` — **O(1)**                                                           |
    | Remove by id      | `.filter()` — **O(n)**, rebuilds whole array    | `.delete(key)` — **O(1)**                                                        |
    | Size              | `.length`                                       | `.size`                                                                          |
    | Key types         | n/a (index-based)                               | ANY type (object, number, etc.), unlike plain `{}` which coerces keys to strings |
    | Iteration order   | insertion order                                 | guaranteed insertion order                                                       |
    | JSON-serializable | ✅ native                                        | ❌ — must convert: `JSON.stringify([...map])` / `new Map(JSON.parse(json))`       |

    ```javascript
      const todos = new Map();
      todos.set(id, { text, completed: false });     // O(1)
      todos.get(id);              // O(1) — no scanning
      todos.delete(id);            // O(1)
       
      [...todos.entries()]  // [[key, value], ...]  — use when you need BOTH id and data
      [...todos.keys()]     // [key, key, ...]
      [...todos.values()]   // [value, value, ...]  — beware: loses the key/id!
    ```

  **When it's worth switching:** frequent lookup/update/delete by id on a growing collection. **When it's not:** filtering/searching is inherently O(n) regardless of data structure — a Map doesn't speed that up, it only speeds up direct key access.
 
  **Python anchor:** `Map` ≈ Python `dict` (any hashable key, insertion order guaranteed, `.get(key)` returns `undefined`/`None` instead of throwing). `.entries()` ≈ `dict.items()`.
 
---

## Regex for "starts-with" search (not substring search)
Naive `.includes()` matches a substring **anywhere** — noisy for search UX. Word-boundary prefix matching is usually what users actually want:
    
  ```javascript
    function escapeRegExp(text) {
        // Neutralize regex special chars in raw user input before building a RegExp from it
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
     
    function matchesSearch(text, query) {
        if (!query) return true;
        const pattern = new RegExp('\\b' + escapeRegExp(query), 'i'); // \b = word boundary, i = case-insensitive
        return pattern.test(text);
    }
     
    matchesSearch("buy milk", "m");   // true  — "milk" STARTS with m
    matchesSearch("chemistry", "m");  // false — the "m" isn't at the start of a word
  ```
  `\b` anchors to the start of *any* word inside the string, vs. `^` which only anchors to the very start of the whole string.

## Session pattern: login/logout with scoped storage

  ```javascript
    function getStorageKey(username) {
        return `todos_${username}`; // one key per user — prevents cross-user data bleed
    }
     
    function loginUser(username) {
        state.currentUser = username;
        state.todos = new Map(JSON.parse(localStorage.getItem(getStorageKey(username))) || []);
        localStorage.setItem('currentUser', username); // resume session across page reloads
    }
     
    function logoutUser() {
        save();                       // persist one last time
        state.currentUser = null;
        state.todos = new Map();      // wipe in-memory state completely
        localStorage.removeItem('currentUser');
    }
  ```

---

## Pointer Events — one API for mouse, touch, and stylus

  ```javascript
  element.addEventListener('pointerdown', (e) => {
      element.setPointerCapture(e.pointerId); // keeps pointermove firing on this element even if the pointer strays outside its box
      function onMove(moveEvent) { /* moveEvent.clientX / clientY work the same regardless of input device */ }
      function onUp() {
          element.removeEventListener('pointermove', onMove);
          element.removeEventListener('pointerup', onUp);
      }
      element.addEventListener('pointermove', onMove);
      element.addEventListener('pointerup', onUp);
      element.addEventListener('pointercancel', onUp); // e.g. the OS interrupts the gesture mid-way
  });
  ```
  ### `pointer-events: none` — invisible-to-input, not just unclickable
  An element with this CSS property doesn't just ignore clicks — the browser treats it as if it isn't there at all for pointer purposes: no cursor change on hover, no `pointerdown`/`click` ever fires, everything passes straight through to whatever's behind it. **Symptom to recognize:** "nothing happens, no errors anywhere, cursor doesn't even change" is this property's signature — check it first before assuming a JS bug.

---

## Quick mental-model glossary

| Term                         | One-line meaning                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event bubbling               | Click travels target → parent → grandparent → ... unless stopped                                                                                  |
| Event delegation             | One listener on a stable parent, inspect `event.target` instead of attaching to every child                                                       |
| `closest(selector)`          | Walk UP the DOM from an element until a matching ancestor (or self) is found                                                                      |
| `dataset`                    | Reads `data-*` HTML attributes, always as strings                                                                                                 |
| Reflection (attr↔prop)       | Browser auto-syncs certain attributes and properties (id, class, href)                                                                            |
| `Map`                        | Dictionary-like structure: O(1) get/set/delete by any key type                                                                                    |
| Big-O of an action           | How work scales as todo count (n) grows — O(1) constant, O(n) linear                                                                              |
| Pointer Events               | One event API (`pointerdown`/`move`/`up`) unifying mouse, touch, and stylus input                                                                 |
| `stopImmediatePropagation()` | Suppresses OTHER listeners on the same element for the same event — unlike `stopPropagation()`, which only affects bubbling to different elements |
 

