import {state} from "./state.js";

export function getStorageKey(username) {
    return `todos_${username}`;
}

// Persistence
export function save() {
    if (!state.currentUser) return;   // // never write to a nonexistent user's key
    
    // Map isn't natively JSON-serializable — spread it into an array of [id, todo] pairs first
    localStorage.setItem(getStorageKey(state.currentUser), JSON.stringify([...state.todos]));
}