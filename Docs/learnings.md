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
- ### Adding Nodes to DOM
  - **appendChild()**: This method is used to add a node to the end of the list of children of a specified parent node.
    ```javascript
    todoList.appendChild(li);
    ```
  - **removeChild()**: To remove a node from the DOM



