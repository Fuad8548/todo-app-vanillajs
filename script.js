// DOM ELEMENTS ======================
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const searchInput = document.getElementById('searchInput');

// Filter buttons
const filterAllBtn = document.getElementById('filterAll');
const filterActiveBtn = document.getElementById('filterActive');
const filterCompletedBtn = document.getElementById('filterCompleted');


// STATE VARIABLES

const STORAGE_KEY = 'todos';
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let filterStatus = 'all';
let searchQuery = '';
let editingId = null;


// INITIALIZATION

renderTodos();
updateCounter();


// EVENT LISTENERS - Add Todo

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});


// EVENT LISTENERS - Filter

filterAllBtn.addEventListener('click', () => {
    filterStatus = 'all';
    updateFilterButtons();
    renderTodos();
});

filterActiveBtn.addEventListener('click', () => {
    filterStatus = 'active';
    updateFilterButtons();
    renderTodos();
});

filterCompletedBtn.addEventListener('click', () => {
    filterStatus = 'completed';
    updateFilterButtons();
    renderTodos();
});


// EVENT LISTENERS - Search

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTodos();
});


// CRUD OPERATIONS

// CREATE - Add new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    todoInput.value = '';
    renderTodos();
    updateCounter();
}

// READ - Display todos with filtering and searching
function renderTodos() {
    todoList.innerHTML = '';

    // STEP 1: Filter by status
    let filteredTodos = todos;

    if (filterStatus === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filterStatus === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // STEP 2: Filter by search query
    if (searchQuery !== '') {
        console.log('Searching for:', searchQuery);
        filteredTodos = filteredTodos.filter(todo => {
            const matches = todo.text.toLowerCase().includes(searchQuery);
            console.log(`Checking "${todo.text}" against "${searchQuery}": ${matches}`);
            return matches;
        });
    }

    // STEP 3: Display todos
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No todos found';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#999';
        emptyMessage.style.padding = '20px';
        todoList.appendChild(emptyMessage);
        return;
    }

    filteredTodos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        if (todo.completed) {
            li.classList.add('completed');
        }

        // Check if in edit mode
        if (editingId === todo.id) {
            li.classList.add('edit-mode');
            li.innerHTML = `
                <input 
                    type="text" 
                    id="editInput-${todo.id}"
                    value="${todo.text}"
                    autocomplete="off"
                >
                <div class="edit-actions">
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;

            // DEFINE FIRST
            const editInput = li.querySelector(`input[type="text"]`);
            const saveBtn = li.querySelector('.save-btn');
            const cancelBtn = li.querySelector('.cancel-btn');

            // THEN USE
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit(todo.id);
                if (e.key === 'Escape') cancelEdit();
            });

            saveBtn.addEventListener('click', () => saveEdit(todo.id));
            cancelBtn.addEventListener('click', cancelEdit);

            // Focus input
            setTimeout(() => {
                editInput.focus();
                editInput.select();
            }, 0);

        } else {
            console.log('Rendering NORMAL MODE for todo:', todo.id);
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${todo.text}</span>
                <button class="edit-btn" onclick="startEdit(${todo.id})">
                    Edit
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    Delete
                </button>
            `;
        }

        todoList.appendChild(li);
    });
}

// UPDATE - Toggle completed
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateCounter();
}

// UPDATE - Start editing
function startEdit(id) {
    editingId = id;
    renderTodos();
}

// UPDATE - Save edited todo
function saveEdit(id) {
    const editInput = document.getElementById(`editInput-${id}`);

    if (!editInput) {
        console.error('Edit input not found for id:', id);
        return;
    }

    const newText = editInput.value.trim();

    if (newText === '') {
        alert('Todo text cannot be empty!');
        return;
    }

    todos = todos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
    );

    editingId = null;
    saveTodos();
    renderTodos();
    updateCounter();
}

// UPDATE - Cancel editing
function cancelEdit() {
    editingId = null;
    renderTodos();
}

// DELETE - Remove todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this todo?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateCounter();
    }
}

// HELPER FUNCTIONS

// Save todos to Local Storage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Update counter display in filter buttons
function updateCounter() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    // Update All button counter
    const allCount = filterAllBtn.querySelector('.count');
    allCount.textContent = `(${total})`;

    // Update Active button counter
    const activeCountSpan = filterActiveBtn.querySelector('.count');
    activeCountSpan.textContent = `(${active})`;

    // Update Completed button counter
    const completedCountSpan = filterCompletedBtn.querySelector('.count');
    completedCountSpan.textContent = `(${completed})`;
}

// Update filter button styles
function updateFilterButtons() {
    filterAllBtn.classList.remove('active');
    filterActiveBtn.classList.remove('active');
    filterCompletedBtn.classList.remove('active');

    if (filterStatus === 'all') {
        filterAllBtn.classList.add('active');
    } else if (filterStatus === 'active') {
        filterActiveBtn.classList.add('active');
    } else if (filterStatus === 'completed') {
        filterCompletedBtn.classList.add('active');
    }
}