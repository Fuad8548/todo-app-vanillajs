import { state, dom } from './state.js';
import { toggleTheme } from './theme.js';
import { loginUser, logoutUser } from './auth.js';
import { addTodo, toggleTodo, startEdit, saveEdit, cancelEdit, deleteTodo } from './todos.js';
import { render } from './render.js';
import { unarchiveTodo } from './todos.js';
import { archiveTodo } from './todos.js';

// Event Listeners Setup
export function setupEventListeners() {
    dom.themeToggle.addEventListener("click", toggleTheme);
    
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

// Handle all todo button-clicks with event delegation
function handleTodoAction(event) {
    const target = event.target;
    const todoItem = target.closest('.todo-item');
    
    if (!todoItem) return;
    
    const id = parseInt(todoItem.dataset.todoId);    

    if (target.classList.contains('edit-btn')) {
        startEdit(id);
    } else if (target.classList.contains('delete-btn')) {
        deleteTodo(id);
    } else if (target.classList.contains('save-btn')) {
        saveEdit(id);
    } else if (target.classList.contains('cancel-btn')) {
        cancelEdit();
    } else if (target.classList.contains("restore-btn")) {
        unarchiveTodo(id)
    } else if (target.classList.contains("archive-btn")) {
        archiveTodo(id);
    }
}

// delegated checkbox handler — replaces inline onchange="toggleTodo(...)"
function handleTodoChange(event) {
    if (event.target.matches('input[type="checkbox"]')) {
        const todoItem = event.target.closest('.todo-item');
        const id = parseInt(todoItem.dataset.todoId);
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