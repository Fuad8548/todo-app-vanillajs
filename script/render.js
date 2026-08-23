import { state, dom } from './state.js';
import { matchesSearch } from './search.js';



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
export function render() {
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
























