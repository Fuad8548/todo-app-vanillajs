import { initTheme } from './theme.js';
import { setupEventListeners } from './events.js';
import { loginUser, showLoginScreen } from './auth.js';

function init() {
    initTheme();
    setupEventListeners();

    // resume an existing session if the browser remembers one
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        loginUser(savedUser);
    } else {
        showLoginScreen();
    }
}

// Initialize
init();


































