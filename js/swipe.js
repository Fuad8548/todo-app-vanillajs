import { dom } from './state.js';
import { deleteTodoDirect, archiveTodo } from './todos.js';
import { showConfirmModal } from './modal.js';
import { showToast } from './toast.js';

const SWIPE_THRESHOLD = 80; // px of horizontal drag needed to count as a real swipe

export function initSwipeGestures() {
    dom.todoList.addEventListener('pointerdown', handlePointerDown);
}

function handlePointerDown(e) {
    // Ignore drags starting on interactive controls, so checkbox/Edit/Delete clicks still work normally
    if (e.target.closest('button, input, .edit-input, .drag-handle')) return;

    const todoItem = e.target.closest('.todo-item');
    if (!todoItem) return;

    const id = parseInt(todoItem.dataset.todoId);
    const startX = e.clientX;
    let currentX = startX;

    // Keeps pointermove firing on this element even if the pointer strays outside its box mid-drag
    todoItem.setPointerCapture(e.pointerId);
    todoItem.style.transition = 'none'; // track 1:1 with the cursor/finger — no easing lag while dragging

    function onMove(moveEvent) {
        currentX = moveEvent.clientX;
        const deltaX = currentX - startX;
        todoItem.style.transform = `translateX(${deltaX}px)`;
        todoItem.classList.toggle('swipe-delete', deltaX > SWIPE_THRESHOLD);
        todoItem.classList.toggle('swipe-archive', deltaX < -SWIPE_THRESHOLD);
    }

    async function onUp() {
        todoItem.removeEventListener('pointermove', onMove);
        todoItem.removeEventListener('pointerup', onUp);
        todoItem.removeEventListener('pointercancel', onUp);

        const deltaX = currentX - startX;
        todoItem.style.transition = ''; // restore CSS transition for whatever happens next
        // todoItem.classList.remove('swipe-delete', 'swipe-archive');

        if (deltaX > SWIPE_THRESHOLD) {
            const confirmed = await showConfirmModal("Are you sure you want to delete the task?");
            todoItem.classList.remove('swipe-delete');
            if (confirmed) {
                finishSwipe(todoItem, () => deleteTodoDirect(id), 1);
            } else {
                todoItem.style.transform = ""; // back to place
            }
        } else if (deltaX < -SWIPE_THRESHOLD) {
            todoItem.classList.remove("swipe-archive");
            const serial = todoItem.dataset.serial;
            finishSwipe(todoItem, () => {
                archiveTodo(id);
                showToast(`Task ${serial} archived`);
            }, -1);
        } else {
            todoItem.classList.remove('swipe-delete', 'swipe-archive');
            todoItem.style.transform = ''; // didn't drag far enough — snap back
        }
    }

    todoItem.addEventListener('pointermove', onMove);
    todoItem.addEventListener('pointerup', onUp);
    todoItem.addEventListener('pointercancel', onUp); // e.g. the OS takes over mid-gesture
}

function finishSwipe(el, action, direction) {
    el.style.transform = `translateX(${direction * 500}px)`; // slide fully off-screen

    // Your .todo-item already has `transition: var(--transition)` in todo-list.css —
    // that same CSS transition animates this transform change, so no extra animation
    // code is needed here. transitionend tells us exactly when it's finished sliding.
    el.addEventListener('transitionend', function handler() {
        el.removeEventListener('transitionend', handler);
        action(); // deleteTodoDirect/archiveTodo — each already calls save()+render() internally
    }, { once: true });
}