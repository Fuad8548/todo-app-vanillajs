import { dom, state } from './state.js';
import { render } from './render.js';
import { save } from './storage.js';

export function initReorder() {
    dom.todoList.addEventListener('pointerdown', handlePointerDown);
}

function handlePointerDown(e) {
    if (state.filterStatus !== 'all') return; // see limitation above — only safe in the unfiltered view

    const handle = e.target.closest('.drag-handle');
    if (!handle) return; // reorder ONLY starts from the handle, never from the row body

    const draggedItem = handle.closest('.todo-item');
    if (!draggedItem) return;

    draggedItem.setPointerCapture(e.pointerId);
    draggedItem.classList.add('dragging');

    function onMove(moveEvent) {
        const afterElement = getSiblingAfterPointer(moveEvent.clientY);
        if (afterElement == null) {
            dom.todoList.appendChild(draggedItem); // dragged below the last row
        } else {
            dom.todoList.insertBefore(draggedItem, afterElement);
        }
    }

    function onUp() {
        draggedItem.removeEventListener('pointermove', onMove);
        draggedItem.removeEventListener('pointerup', onUp);
        draggedItem.removeEventListener('pointercancel', onUp);
        draggedItem.classList.remove('dragging');
        commitNewOrder();
    }

    draggedItem.addEventListener('pointermove', onMove);
    draggedItem.addEventListener('pointerup', onUp);
    draggedItem.addEventListener('pointercancel', onUp);
}

// Compares the pointer's Y position against every OTHER row's vertical
// midpoint, to figure out which row the dragged item should be inserted
// before. Returns null if the pointer is below every remaining row.
function getSiblingAfterPointer(y) {
    const items = [...dom.todoList.querySelectorAll('.todo-item:not(.dragging)')];

    return items.reduce((closest, item) => {
        const box = item.getBoundingClientRect();
        const offset = y - box.top - box.height / 2; // negative = pointer is above this row's midpoint

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: item };
        }
        return closest;
    }, { offset: -Infinity, element: null }).element;
}

// Reads the CURRENT DOM order of <li> elements, then rebuilds state.todos
// as a NEW Map in that exact order. Map preserves insertion order, so the
// next render() naturally reflects the new sequence — and since renderTodos()
// already computes `serial = index + 1` from render order, numbering updates
// automatically. No extra code needed for that part — it just falls out.
function commitNewOrder() {
    const orderedIds = [...dom.todoList.querySelectorAll('.todo-item')]
        .map(li => parseInt(li.dataset.todoId));

    const reordered = new Map();
    orderedIds.forEach(id => reordered.set(id, state.todos.get(id)));

    state.todos = reordered;
    save();
    render();
}