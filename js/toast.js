export function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    
    toast.offsetHeight;
    toast.classList.add("toast-visible");

    setTimeout(() => {
        toast.classList.remove("toast-visible");
        toast.addEventListener("transitionend", () => {
            toast.remove(),
            { once: true };
        })
    }, 2000);
}