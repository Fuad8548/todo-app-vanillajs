// DOM Cache
export const dom = {
    // Auth UI
    loginSection: document.getElementById('loginSection'),
    appSection: document.getElementById('appSection'),
    usernameInput: document.getElementById('usernameInput'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    currentUserLabel: document.getElementById('currentUserLabel'),
    themeToggle: document.getElementById('themeToggle'),

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
export const state = {
    currentUser: null,   // who's logged in right now
    todos: new Map(),   // id => todo object. Map instead of Array: O(1) get/ set/ delete by id
    filterStatus: 'all',
    searchQuery: '',
    editingId: null
};