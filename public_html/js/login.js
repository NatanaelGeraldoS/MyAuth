import { showBootstrapToast } from "./util.js";

const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById("loadingOverlay").classList.remove("d-none");
    let isValid = true;
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe").checked;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        emailInput.classList.remove("is-valid");
        isValid = false;
    }

    // Password strength check
    if (passwordInput.value.trim().length < 0) {
        passwordInput.classList.add("is-invalid");
        passwordInput.classList.remove("is-valid");
        isValid = false;
    }

    // Prevent form submission if invalid
    if (!isValid) {
        e.preventDefault();
    }

    const informationLogin = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
        rememberMe: rememberMe,
    };
    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(informationLogin),
        });

        const result = await response.json();

        if (response.status === 200) {
            showBootstrapToast(`Login Successful!`);

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
        } else {
            showBootstrapToast(`Login Failed: ${result.message}`, "error");
        }
        document.getElementById("loadingOverlay").classList.add("d-none");
    } catch (error) {
        console.error("Error:", error);
        showBootstrapToast(`Something when wrong.`, "error");
        document.getElementById("loadingOverlay").classList.add("d-none");
    }
});
