import {state, dom} from './state.js';
import {getStorageKey, save} from './storage.js';
import {render} from "./render.js";


// Auth: login/ logout
export function isValidUsername(username) {
    // ^ and $ = must match the ENTIRE string, start to end (not just find a match somewhere inside it)
    // [a-zA-Z0-9_-]+ = one or more letters, digits, underscores, or hyphens — nothing else allowed
    const pattern = /^[a-zA-Z0-9](?!.*[-_]{2,})[a-zA-Z0-9_-]{2,19}$/;
    return pattern.test(username);
}

export function loginUser(username) {
    if (!isValidUsername(username)) {
        alert('Username can only contain letters, numbers, hyphens, and underscores — no spaces or special characters');
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

export function logoutUser() {
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

export function showLoginScreen() {
    dom.loginSection.style.display = 'block';
    dom.appSection.style.display = 'none';
}

export function showAppScreen() {
    dom.loginSection.style.display = 'none';
    dom.appSection.style.display = 'block';
    dom.currentUserLabel.textContent = state.currentUser;
}