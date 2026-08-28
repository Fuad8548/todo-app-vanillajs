import { state, dom } from './state.js';
import { matchesSearch } from './search.js';
import { animateIn } from './animations.js';


// Filtering & Searching
function getFilteredTodos() {
    // Pull id from the Map KEY thru entries iterator,
    // spread into real array: [[key, val], [key, val],.....]
    // build a NEW object: spread todo's fields, then add/overwrite `id`
    let filtered = [...state.todos.entries()].map(([id, todo]) => ({...todo, id}));

    if (state.filterStatus === "archived") {
        filtered = filtered.filter(todo => todo.archived);
    } else if (state.filterStatus === 'active') {
            filtered = filtered.filter(todo => !todo.completed && !todo.archived);
    } else if (state.filterStatus === 'completed') {
            filtered = filtered.filter(todo => todo.completed && !todo.archived);
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

    filtered.forEach((todo, index) => {
        const serial = index + 1;
        
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.archived ? "archived" : ""}`;
        li.dataset.todoId = todo.id;  // Store ID as data attribute
        li.dataset.serial = serial;

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
        if (todo.id === state.lastAddedId) {
            animateIn(li);
        }

        li.innerHTML = state.editingId === todo.id ? createEditHTML(todo.id, todo.text) : createTodoHTML(todo, serial);
    });

    state.lastAddedId = null;
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

// swap Edit for Restore when viewing an archived item
// render.js — createTodoHTML, rewritten to branch on archived state
// and include: a decorative swipe-hint icon, a serial number (see point 4), and a manual Archive button
function createTodoHTML(todo, serial) {
    const icon = `<span class="swipe-hint drag-handle" title="Drag to reorder • Swipe to archive/delete">⠿</span>`;
    const number = `<span class="todo-serial">${serial}.</span>`;
    const text = `<span class="todo-text">${escapeHTML(todo.text)}</span>`;

    if (todo.archived) {
        return `${icon}${number}${text}
            <span class="archived-badge">Archived</span>
            <button class="restore-btn">Restore</button>
            <button class="delete-btn">Delete</button>`;
    }

    const checkbox = `<input type="checkbox" ${todo.completed ? 'checked' : ''}>`;
    const archiveBtn = todo.completed ? '' : `<button class="archive-btn">Archive</button>`;

    return `${icon}${number}${checkbox}${text}${archiveBtn}
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>`;
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
    let archived = 0;
    const total = state.todos.size;

    for (const todo of state.todos.values()) {    
        if (todo.archived) {
            archived ++;
            continue;
        }
        if (todo.completed) completed++;
    }

    const active = total - archived - completed;

    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        const counts = { all: total, active, completed, archived };
        btn.querySelector('.count').textContent = `(${counts[status]})`;
    });
}

function updateFilterButtons() {
    Object.entries(dom.filterButtons).forEach(([status, btn]) => {
        btn.classList.toggle('active', state.filterStatus === status);
    });
}
























