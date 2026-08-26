import { dom } from "./state.js";

// showConfirmModal(message) returns a Promise<boolean> —
// resolves true if "Delete" was clicked, false if "Cancel" or the backdrop/Escape closed it
export function showConfirmModal(message) {
    return new Promise((resolve) => {
        dom.confirmMessage.textContent = message;
        dom.confirmModal.showModal(); // native browser method — opens as a real modal

        let confirmed = false; 
        
        function onYes() {
            confirmed = true;
            dom.confirmModal.close();
        }

        function onNo() {
            confirmed = false;
            dom.confirmModal.close();
        }

        function onBackdropClick(e) {
            if (e.target === dom.confirmModal) {
                confirmed == false;
                dom.confirmModal.close();
            }
        }

        function onClose() {
            dom.confirmYes.removeEventListener('click', onYes);            
            dom.confirmNo.removeEventListener('click', onNo);            
            dom.confirmModal.removeEventListener('click', onBackdropClick);            
            dom.confirmYes.removeEventListener('close', onClose); 
            resolve(confirmed);           
        }

        dom.confirmYes.addEventListener('click', onYes);
        dom.confirmNo.addEventListener('click', onNo);
        dom.confirmModal.addEventListener('click', onBackdropClick);
        dom.confirmModal.addEventListener('close', onClose); // native dialog event
    });
}