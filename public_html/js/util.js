// Toaster functionality from bootstrap template
export function showBootstrapToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");

    // Create a toast wrapper
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white border-0 bg-${
        type === "success" ? "success" : "danger"
    }`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    // Toast inner HTML
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Initialize and show toast using Bootstrap's toast class
    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000,
        autohide: true,
    });
    bsToast.show();

    // Cleanup after it's hidden
    toast.addEventListener("hidden.bs.toast", () => {
        toast.remove();
    });
}
