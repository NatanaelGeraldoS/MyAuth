import { showBootstrapToast } from "./util.js";

const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById("loadingOverlay").classList.remove("d-none");
    let isValid = true;
    const tokenInput = document.getElementById("token");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");

    // Password confirmation check
    if (passwordInput.value !== confirmInput.value) {
        confirmInput.classList.add("is-invalid");
        confirmInput.classList.remove("is-valid");
        isValid = false;
    } else {
        confirmInput.classList.add("is-valid");
        confirmInput.classList.remove("is-invalid");
    }

    // Password strength check
    if (passwordInput.value.length < 6) {
        passwordInput.classList.add("is-invalid");
        passwordInput.classList.remove("is-valid");
        isValid = false;
    } else {
        passwordInput.classList.add("is-valid");
        passwordInput.classList.remove("is-invalid");
    }

    // Prevent form submission if invalid
    if (!isValid) {
        e.preventDefault();
    }

    const informationResetPassword = {
        password: passwordInput.value,
        token: tokenInput.value,
    };
    try {
        const response = await fetch("/api/auth/resetPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(informationResetPassword),
        });

        const result = await response.json();

        if (response.status === 200) {
            showBootstrapToast(`Password has been reset`);
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } else {
            showBootstrapToast(
                `Reset Password Failed: ${result.message}`,
                "error"
            );
        }
        document.getElementById("loadingOverlay").classList.add("d-none");
    } catch (error) {
        console.error("Error:", error);
        showBootstrapToast(`Something when wrong.`, "error");
        document.getElementById("loadingOverlay").classList.add("d-none");
    }
});
