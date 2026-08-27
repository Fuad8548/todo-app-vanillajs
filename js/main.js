import { initTheme } from './theme.js';
import { setupEventListeners } from './events.js';
import { loginUser, showLoginScreen } from './auth.js';
import { initSwipeGestures } from './swipe.js';
import { initReorder } from './reorder.js';

function init() {
    initTheme();
    setupEventListeners();
    initSwipeGestures();
    initReorder();

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


































