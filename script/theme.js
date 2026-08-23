import {dom} from "./state.js";

// THEME: light / dark mode
export function initTheme() {
    const saved = localStorage.getItem("theme");  // 'light' | 'dark' | null  

    // // No saved preference yet? Fall back to the OS-level preference.
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === "dark" : prefersDark;

    // Force (not flip) the class to match the resolved preference
    document.body.classList.toggle("dark-mode", isDark);
    updateThemeIcon(isDark);
}

export function toggleTheme() {
    // No boolean arg here — this IS the flip, driven by a click
    const isDark = document.body.classList.toggle("dark-mode");

    localStorage.setItem('theme', isDark ? "dark" : "light");
    updateThemeIcon(isDark); 
}

function updateThemeIcon(isDark) {
    dom.themeToggle.textContent = isDark ? "☀️" : "🌙";
    dom.themeToggle.setAttribute('aria-label', isDark ? "Switch to light mode" : "Switch to dark mode");   
}