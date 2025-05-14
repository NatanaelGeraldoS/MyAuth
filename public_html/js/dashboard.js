import { showBootstrapToast } from "./util.js";

async function getUserInformation() {
    document.getElementById("loadingOverlay").classList.remove("d-none");
    try {
        const response = await fetch("/api/auth/account-information");
        const user = await response.json();

        const date = new Date(user.DoB);

        const options = { day: "2-digit", month: "short", year: "numeric" };
        const formattedDate = date.toLocaleDateString("en-GB", options);

        document.getElementById("UserId").innerText = user.id;
        document.getElementById("UserName").innerText = user.Name;
        document.getElementById("UserEmail").innerText = user.Email;
        document.getElementById("UserDoB").innerText = formattedDate;
        document.getElementById("UserGender").innerHTML =
            user.Gender.toLowerCase() === "male"
                ? `<span class="badge bg-primary rounded-pill px-3 py-2">Male</span>`
                : `<span class="badge bg-danger rounded-pill px-3 py-2">Female</span>`;
        document.getElementById("loadingOverlay").classList.add("d-none");
    } catch (error) {
        console.error(
            "ERROR : Failed to fetch user information",
            error.message
        );
        showBootstrapToast(error.message, "error");
        document.getElementById("loadingOverlay").classList.add("d-none");
    }
}

window.addEventListener("DOMContentLoaded", getUserInformation);
