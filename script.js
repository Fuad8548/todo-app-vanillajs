// DOM Cache
const dom = {
    // Auth UI
    loginSection: document.getElementById('loginSection'),
    appSection: document.getElementById('appSection'),
    usernameInput: document.getElementById('usernameInput'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    currentUserLabel: document.getElementById('currentUserLabel'),

    todoInput: document.getElementById('todoInput'),
    addBtn: document.getElementById('addBtn'),
    todoList: document.getElementById('todoList'),
    searchInput: document.getElementById('searchInput'),
    filterButtons: {
        all: document.getElementById('filterAll'),
        active: document.getElementById('filterActive'),
        completed: document.getElementById('filterCompleted')
    }
};

// State Management
const state = {
    currentUser: null,   // who's logged in right now
    todos: new Map(),   // id => todo object. Map instead of Array: O(1) get/ set/ delete by id
    // todos: JSON.parse(localStorage.getItem('todos')) || [],
    filterStatus: 'all',
    searchQuery: '',
    editingId: null
};

// Initialize
init();

function init() {
    setupEventListeners();

    // NEW: resume an existing session if the browser remembers one
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        loginUser(savedUser);
    } else {
        showLoginScreen();
    }
}

// Auth: login/ logout

function getStorageKey(username) {
    return `todos_${username}`;
}

function loginUser(username) {
    if (!username) {
        alert('Please enter a username');
        return;
    }

    // Reset session-specific state — nothing from a previous user carries over
    state.currentUser = username;
    // Stored JSON is an array of [id, todo] pairs — new Map(pairs) rebuilds the Map from that
    const stored = JSON.parse(localStorage.getItem(getStorageKey(username))) || [];
    state.todos = new Map(stored);
    state.filterStatus = 'all';
    state.searchQuery = '';
    state.editingId = null;

    localStorage.setItem('currentUser', username); // remember session across page reloads
    dom.searchInput.value = '';
    dom.todoInput.value = '';
 
    showAppScreen();
    render();
}

function logoutUser() {
    if (!state.currentUser) return;
 
    save(); // persist this user's todos one last time before we clear them from memory

    // Wipe the in-memory session completely — this is the "cleanup" step.
    // We don't need removeEventListener here: handleTodoAction, addTodo, etc. all
    // read from `state` fresh on every call rather than closing over `currentUser`,
    // so once state.todos is emptied, stale data has nowhere left to leak from.
    state.currentUser = null;
    state.todos = new Map();
    state.editingId = null;
    state.searchQuery = '';
    state.filterStatus = 'all';
 
    localStorage.removeItem('currentUser');
    dom.usernameInput.value = '';
 
    showLoginScreen();
    render();
}

function showLoginScreen() {
    dom.loginSection.style.display = 'block';
    dom.appSection.style.display = 'none';
}

function showAppScreen() {
    dom.loginSection.style.display = 'none';
    dom.appSection.style.display = 'block';
    dom.currentUserLabel.textContent = state.currentUser;
}

// Event Listeners Setup
function setupEventListeners() {
    // NEW: auth listeners — these are page-structural (attached once, forever),
    // exactly like addBtn/searchInput below. They don't need add/remove per session.
    dom.loginBtn.addEventListener('click', () => loginUser(dom.usernameInput.value));
    dom.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginUser(dom.usernameInput.value);
    });
    dom.logoutBtn.addEventListener('click', logoutUser);

    // Add todo
    dom.addBtn.addEventListener('click', addTodo);
    dom.todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Search
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        render();
    });

    // Filter buttons
    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        btn.addEventListener('click', () => {
            state.filterStatus = status;
            render();
        });
    });

    // EVENT DELEGATION - Single listener for all todo actions
    dom.todoList.addEventListener('click', handleTodoAction);
    dom.todoList.addEventListener('keypress', handleTodoKeyPress);

    // delegate checkbox toggling too, instead of inline onchange="..."
    dom.todoList.addEventListener('change', handleTodoChange);
}

// Handle all todo button clicks with event delegation
function handleTodoAction(event) {
    const target = event.target;
    const todoItem = target.closest('.todo-item');
    
    if (!todoItem) return;

    
    const id = parseInt(todoItem.dataset.todoId);
    console.log('id:', id, 'type:', typeof id, 'found in Map?', state.todos.has(id));
    

    if (target.classList.contains('edit-btn')) {
        startEdit(id);
    } else if (target.classList.contains('delete-btn')) {
        deleteTodo(id);
    } else if (target.classList.contains('save-btn')) {
        saveEdit(id);
    } else if (target.classList.contains('cancel-btn')) {
        cancelEdit();
    }
}

// delegated checkbox handler — replaces inline onchange="toggleTodo(...)"
function handleTodoChange(event) {
    if (event.target.matches('input[type="checkbox"]')) {
        const todoItem = event.target.closest('.todo-item');
        const id = parseInt(todoItem.dataset.todoId);
        console.log('id:', id, 'type:', typeof id, 'found in Map?', state.todos.has(id));
        toggleTodo(id);
    }
}

// Handle keyboard events in edit mode
function handleTodoKeyPress(event) {
    if (event.target.classList.contains('edit-input')) {
        const todoItem = event.target.closest('.todo-item');
        const id = parseInt(todoItem.dataset.todoId);

        if (event.key === 'Enter') saveEdit(id);
        if (event.key === 'Escape') cancelEdit();
    }
}


// CRUD Operations
function addTodo() {
    const text = dom.todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a task!');
        return;
    }

    const id = Date.now();

    state.todos.set(id, {   // O(1) insert
        text,
        completed: false
    });

    dom.todoInput.value = '';
    save();
    render();
}


function toggleTodo(id) {
    const todo = state.todos.get(id) // O(1) instead of scanning (O(n))
    if (!todo) return;
    todo.completed = !todo.completed;   // mutate directly — Map stores the object by reference
    save();
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

    const todo = state.todos.get(id);
    if (todo) todo.text = newText;

    state.editingId = null;
    save();
    render();
}

function cancelEdit() {
    state.editingId = null;
    render();
}


function deleteTodo(id) {
    if (confirm('Are you sure?')) {
        state.todos.delete(id);    // O(1) instead of O(n) filter
        save();
        render();
    }
}


// Filtering & Searching
function getFilteredTodos() {
    // Pull id from the Map KEY thru entries iterator,
    // spread into real array: [[key, val], [key, val],.....]
    // build a NEW object: spread todo's fields, then add/overwrite `id`
    let filtered = [...state.todos.entries()].map(([id, todo]) => ({...todo, id}));

    if (state.filterStatus === 'active') {
        filtered = filtered.filter(todo => !todo.completed);
    } else if (state.filterStatus === 'completed') {
        filtered = filtered.filter(todo => todo.completed);
    }

    if (state.searchQuery) {
        filtered = filtered.filter(todo =>
            matchesSearch(todo.text, state.searchQuery)
        );
    }

    return filtered;
}

// Rendering
function render() {
    if (!state.currentUser) return;  // nothing to render while logged out
    renderTodos();
    updateCounter();
    updateFilterButtons();
}

function renderTodos() {
    const filtered = getFilteredTodos();

    dom.todoList.innerHTML = '';

    if (filtered.length === 0) {
        dom.todoList.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">No todos found</li>';
        return;
    }

    filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.todoId = todo.id;  // Store ID as data attribute

        if (state.editingId === todo.id) {
            li.classList.add('edit-mode');
            li.innerHTML = createEditHTML(todo.id, todo.text);
            
            // Auto-focus after rendering
            setTimeout(() => {
                const editInput = li.querySelector('.edit-input');
                if (editInput) {
                    editInput.focus();
                    editInput.select();
                }
            }, 0);
        } else {
            li.innerHTML = createTodoHTML(todo);
        }

        dom.todoList.appendChild(li);
    });
}

function createEditHTML(id, text) {
    return `
        <input 
            type="text" 
            class="edit-input"
            id="editInput-${id}"
            value="${escapeHTML(text)}"
            autocomplete="off"
        >
        <div class="edit-actions">
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;
}

function createTodoHTML(todo) {
    // NEW: no more inline onchange — the checkbox is now handled by
    // the delegated 'change' listener (handleTodoChange) on dom.todoList
    return `
        <input 
            type="checkbox" 
            ${todo.completed ? 'checked' : ''}
        >
        <span class="todo-text">${escapeHTML(todo.text)}</span>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;
}

// HTML Escape Helper
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Escapes regex special characters so raw user input can't break `new RegExp(...)`
// e.g. if someone types "c++" or "1.5", those symbols mean something in regex syntax —
// this neutralizes them so they're treated as literal characters to search for.
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Matches if `query` is a prefix of ANY word inside `text`, not a substring anywhere.
// \b = word boundary — anchors the match to the start of a word, e.g.:
function matchesSearch(text, query) {
    if (!query) return true; // empty search shows everything
    const pattern = new RegExp('\\b' + escapeRegExp(query), 'i'); // 'i' = case-insensitive
    return pattern.test(text);
}



// update todo counter 
function updateCounter() {
    // single pass instead of three separate scans
    let completed = 0;
    for (const todo of state.todos.values()) {
        if (todo.completed) completed++;
    }
    
    const total = state.todos.size;  // Map uses .size, not .length
    const active = total - completed;

    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        const counts = { all: total, active, completed };
        btn.querySelector('.count').textContent = `(${counts[status]})`;
    });
}

function updateFilterButtons() {
    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        btn.classList.toggle('active', state.filterStatus === status);
    });
}

// Persistence
function save() {
    if (!state.currentUser) return;   // // never write to a nonexistent user's key
    
    // Map isn't natively JSON-serializable — spread it into an array of [id, todo] pairs first
    localStorage.setItem(getStorageKey(state.currentUser), JSON.stringify([...state.todos]));
}
