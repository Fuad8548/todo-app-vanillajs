// STATE VARIABLES
const STORAGE_KEY = 'todos';
const state = {
    todos: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
    filterStatus: 'all',
    searchQuery: '',
    editingId: null
}


// DOM ELEMENTS ======================
const dom = {
    todoInput: document.getElementById('todoInput'),
    addBtn: document.getElementById('addBtn'),
    todoList: document.getElementById('todoList'),
    searchInput: document.getElementById('searchInput'),
    
    // Filter buttons
    filterButtons: {
        all: document.getElementById('filterAll'),
        active: document.getElementById('filterActive'),
        completed: document.getElementById('filterCompleted')
    }
}


// INITIALIZATION
init();

function init(){
    setupEventListeners();
    render();
}


// EVENT LISTENERS Setup
function setupEventListeners() {
    // Add Todo
    dom.addBtn.addEventListener('click', addTodo);
    dom.todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Search
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        render();
    });

    //Filter Buttons
    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        btn.addEventListener('click', () => {
            state.filterStatus = status;
            render();
        })
    })
}


// CRUD OPERATIONS

// CREATE - Add new todo
function addTodo() {
    const text = dom.todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a task!');
        return;
    }

    state.todos.push({
        id: Date.now(),
        text,
        completed: false
    });

    dom.todoInput.value = '';
    saveTodos();
    render();
}

function toggleTodo(id) {
    state.todos = state.todos.map(todo => 
        (todo.id === id ? {...todo, completed: !todo.completed } : todo)
    );
    saveTodos();
    render();
}

function startEdit(id) {
    state.editingId = id;
    render();
}

function saveEdit(id) {
    const editInput = document.getElementById(`editInput-${id}`);
    const newText = editInput.value.trim();

    if (!newText) {
        alert('Todo text cannot be empty!');
        return;
    }

    state.todos = state.todos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
    );

    state.editingId = null;
    saveTodos();
    render();
}

function cancelEdit() {
    state.editingId = null;
    render();
}

function deleteTodo(id) {
    if (confirm('Are you sure?')) {
        state.todos = state.todos.filter(todo => todo.id !== id);
        saveTodos();
        render();
    }
}

// READ - Display todos with filtering and searching
function getFilteredTodos() {
    // STEP 1: Filter by status
    let filteredTodos = state.todos;

    if (state.filterStatus === 'active') {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (state.filterStatus === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }

    // STEP 2: Filter by search query
    if (state.searchQuery) {
        filteredTodos = filteredTodos.filter(todo =>
            todo.text.toLowerCase().includes(state.searchQuery)
        );
    }
    return filteredTodos;
}

// Rendering 
function render() {
    renderTodos();
    updateCounter();
    updateFilterButtons();
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();

    dom.todoList.innerHTML = "";

    if (filteredTodos.length === 0) {
        dom.todoList.innerHTML = "<li style='text-align: center; color: #999; padding: 20px;'>No todos found</li>";
        return;
    }


    filteredTodos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        
        // Check if in edit mode
        if (state.editingId === todo.id) {
            li.classList.add('edit-mode');
            li.innerHTML = createEditHTML(todo.id, todo.text);
            attachEditListener(li, todo.id);
        } else {
            li.innerHTML = createTodoHTML(todo);
        }
        
        dom.todoList.appendChild(li);
    })        
}

// Helper function to escape HTML special characters
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
            
function createEditHTML(id, text) {
    return `
        <input 
            type = "text"
            id = "editInput-${id}"
            value = "${escapeHTML(text)}"
            autocomplete = "off"
        >
        <div class = "edit-actions">
            <button class = "saveTodos-btn">Save</button>
            <button class = "cancel-btn">Cancel</button>
        </div>
    `;
}

function createTodoHTML(todo) {
    return `
        <input
            type = "checkbox"
            ${todo.completed ? "checked" : ""}
            onchange = "toggleTodo(${todo.id})"
        >
        <span class="todo-text">${escapeHTML(todo.text)}</span>
        <button class="edit-btn" onclick="startEdit(${todo.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
    `;
}

function attachEditListener(li, id) {
    const editInput = li.querySelector('input[type="text"]');
    const saveTodosBtn = li.querySelector('.saveTodos-btn');
    const cancelBtn = li.querySelector('.cancel-btn');

    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit(id);
        if (e.key === 'Escape') cancelEdit();
    });

    saveTodosBtn.addEventListener('click', () => saveEdit(id));
    cancelBtn.addEventListener('click', cancelEdit);

    // Auto-focus
    setTimeout(() => {
        editInput.focus();
        editInput.select();
    }, 0);
}

// update counter
function updateCounter() {
    const total = state.todos.length;
    const active = state.todos.filter(todo => !todo.completed).length;
    const completed = state.todos.filter(todo => todo.completed).length;

    // update all button in one go
    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        const counts = { all: total, active, completed};
        btn.querySelector('.count').textContent = `(${counts[status]})`;
    })
}


function updateFilterButtons() {
    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        btn.classList.toggle('active', state.filterStatus === status);
    })
}


// Save todos to Local Storage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(state.todos));
}


