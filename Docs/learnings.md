<div align="center">A todo app to learn vanilla.js</div>

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
        this will return a collection of nodes as NodeList(). We can work with this collection exactly like any JS array. i.e., ```unorderedTodo.length```; iteration: 
        ```javascript 
        for (let i = 0; i < matches.length; i++) {
            console.log(matches[i]);    
        } 
        ```          
      - all elements with a specific attribute, like all links that take users to a specific URL: 
        ```document.querySelectorAll("a[href='https://www.example.com/']");```
- ### Creating Element Object:
  - **innerHTML**: It is a property of Element objects that we can use to set their HTML markup with a string. Then, we set the innerHTML property of the container to a string: 
  ```Javascript
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "<li style='text-align: center; color: #999; padding: 20px;'>No todos found</li>";
  ```
  Though innerHTML is helpful, it has some security issues if a user enter a string of malicious contents. So, textContent is recommended to insert plain text. 
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
    **Let's have a quick difference among innerHTML, innerText and textContent:**
    |  Property   |           Returns           | Aware of CSS/visibility? | Includes HTML tags? |                          Performance                           |
    | :---------: | :-------------------------: | :----------------------: | :-----------------: | :------------------------------------------------------------: |
    | textContent | All text (including hidden) |           ❌ No           |        ❌ No         |                        Fast (no reflow)                        |
    |  innerText  |      Only visible text      |          ✅ Yes           |        ❌ No         | Slower (triggers reflow, since it must compute what's visible) |
    |  innerHTML  |       Raw HTML string       |           ❌ No           |        ✅ Yes        |                            Moderate                            |

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
    // "\n  Hello <span style="display:none">Hidden</span> <b>World</b>\n"  → gets the actual HTML markup as a string
    ```
- ### Adding to and removing nodes from DOM
  - **appendChild()**: This method is used to add a node to the end of the list of children of a specified parent node.
    ```javascript
    todoList.appendChild(li);
    ```
  - **removeChild()**: To remove a node from the DOM

## Dynamically update attributes of HTML element
- **setAttribute(name, value)**: Sets the value of an attribute on a DOM element. If the attribute already exists, it updates it; if not, it creates it.
  - Values are always strings, not number:
    ```javascript
    btn.setAttribute('data-count', 5);
    console.log(btn.getAttribute('data-count')); // "5" 
    ```
  - Different from setting a property directly: This is because HTML attribute and JS object properties are two different thing
    - ```getAttribute("value")``` interacts with the HTML attribute in the DOM markup. It defines the default or initial value of the input field.
    - ```.value``` interacts with the JavaScript property. It represents the current live value typed by the user or changed via script.
    - Changing the attribute (```setAttribute()```) updates the default value. It will only update the screen if the user or a script hasn't modified the live property yet.
    - ```.value``` updates the live state and what the user sees on the screen. It never updates the HTML attribute.
    const input = document.createElement('input');
    ```javascript
    input.type = 'text';
    input.setAttribute('value', 'foo');
    input.value = 'bar';
    console.log(input.getAttribute('value')); // "foo"
    console.log(input.value);                 // "bar"
    ```

## Events
  When the user clicks on a button or there is a change in a form, this is known as an event. In our programs, we will need to have a way to listen for these events and respond to them.
  - **addEventListener()**: this method is used to listen for events. It takes two arguments: the event we want to listen for and a function that will be called when the event occurs.
  ```javascript
  element.addEventListener("event", listener);
  ```
  For example, we have a ```button``` element with the id   ```btn```: 
  ```html
  <button id="btn">Add Todo</button>
  ```
  ```javascript
  const btn = document.getElementById("btn");

  btn.addEventListener("click", (e) => {
    console.log("clicked!")
  })
  ```
  to input something:
  ```html
  <input type="text" id="input" placeholder="Type something" />
  ```
  ```javascript
  const input = document.getElementById("input");

  input.addEventListener("input", () => {
    console.log(input.value);
  });
  ```
  - **stopPropagation()**: See the codebase below:
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
      deleteBtn.addEventListener('click', function(event) { 
        // Stop the event from bubbling up to the card 
        event.stopPropagation();
        console.log('Button clicked!');
      });
      ```
      If you click the button it will log only "Button clicked!" in the console. But if you commment ```event.stopPropagation()``` both texts will be logged. That means button and it's parent will be clicked. the browser doesn't just fire listeners on the button. It fires the event in phases, going down then back up the DOM tree:
      1. CAPTURE phase: window → document → .card → .btn  (top to bottom)
      2. TARGET phase: fires on .btn itself
      3. BUBBLE phase: .btn → .card → document → window   (bottom to top, this is the default)
      Our listeners are both in the default bubble phase. So clicking the button:
      4. Fires on .btn → logs "Button clicked"
      5. Then bubbles up to .card, which also has a click listener → logs "Card container clicked!"
      - **Real-world example**: a card that's clickable to "open details," but has a delete button (X) inside it.
      - **Without stopPropagation()**: clicking the delete button also triggers "open details" — because the click bubbled up to the card's listener too. That's a bug.
  - **preventDefault()**: Stops reloading the page during form submission.
      ```javascript
      form.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log('Form intercepted');
      });
      ```
  - **Event Delegation**: Instead of attaching a listener to every ``<li>``, attach one to the parent and inspect event.target:
      ```javascript
      document.querySelector('#list').addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
          console.log('You clicked:', e.target.textContent);
        }
      });
      ```
  - **removeEventListener()**: To remove an event listener this method is called. It is significant while logging out of a user and removing session history. Otherwise, 
    - **Memory leakage**:  as long as a listener is attached to document/ window (which never get garbage collected on their own), the function it references -- stays alive in memory foreever, even after the user is gone. 
      ```javascript
      function loginUser(userId) {
        function autoSaveDraft(event) {
          saveToServer(userId, event.target.value); // closure over userId
        }
        messageBox.addEventListener('input', autoSaveDraft);
        // stash it somewhere so we can remove it later
        currentSession.autoSaveDraft = autoSaveDraft;
      }

      function logoutUser() {
        messageBox.removeEventListener('input', currentSession.autoSaveDraft);
      }
      ```
      however, React ```useEffect()``` do this under the hood: 
      ```javascript
      useEffect(() => {
        window.addEventListener('mousemove', handleAction);

        // 2. Return a cleanup function
        return () => {
          window.removeEventListener('mousemove', handleAction);
        };
      }, [isLoggedIn]);
      ```








