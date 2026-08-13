<div align="center">A todo app to learn vanilla.js</div>

- Browser API:
  - DOM API: A programming interface to manipulate HTML elements, their styles, and attributes.
  - Storage API: to store data locally on the user’s device.

- Web API:
  - getElementById(): We can get an object that represents the HTML element with the specified id. Ids must be unique in every HTML document.
  - querySelector(): With it, we can get the first element in the HTML document that matches the CSS selector passed as argument.
    - querySelectorAll(): 
      - to match all elements of a specific type:
        ```document.querySelectorAll("div");```
      - All elements with a specific class:
        ```document.querySelectorAll(".rounded");```
      - All elements with a specific ID:
        ```document.querySelectorAll("#logo");```
      - matches all list items within an unordered list element and assign the return value to the unordered constant:
        ```const unordered = document.querySelectorAll("ul.unordered li");```
        this will return a collection of nodes as NodeList(). We can work with this collection exactly like any JS array. i.e., ```unordered.length```; iteration: 
        ```for (let i = 0; i < matches.length; i++) {
            console.log(matches[i]);    
        } ```          
      - all elements with a specific attribute, like all links that take users to a specific URL: 
        ```document.querySelectorAll("a[href='https://www.example.com/']");```
      - 








