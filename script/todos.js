import { state, dom } from './state.js';
import { save } from './storage.js';
import { render } from './render.js';
import { showConfirmModal } from './modal.js';

// CRUD Operations
export function addTodo() {
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


export function toggleTodo(id) {
    const todo = state.todos.get(id) // O(1) instead of scanning (O(n))
    if (!todo) return;
    todo.completed = !todo.completed;   // mutate directly — Map stores the object by reference
    save();
    render();
}

export function startEdit(id) {
    state.editingId = id;
    render();
}

export function saveEdit(id) {
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

export function cancelEdit() {
    state.editingId = null;
    render();
}


export async function deleteTodo(id) {
    const confirmed = await showConfirmModal("Are you sure?");
    if (confirmed) {
        state.todos.delete(id);    // O(1) instead of O(n) filter
        save();
        render();
    }
}