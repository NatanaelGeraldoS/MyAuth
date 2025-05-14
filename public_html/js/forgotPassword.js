import { showBootstrapToast } from "./util.js";

const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById("loadingOverlay").classList.remove("d-none");
    let isValid = true;
    const emailInput = document.getElementById("email");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        emailInput.classList.remove("is-valid");
        isValid = false;
    }

    // Prevent form submission if invalid
    if (!isValid) {
        e.preventDefault();
    }

    const informationResetPassword = {
        email: emailInput.value.trim(),
    };
    try {
        const response = await fetch("/api/auth/forgotPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(informationResetPassword),
        });

        const result = await response.json();

        if (response.status === 200) {
            showBootstrapToast(
                `Reset Password Successful, Please check your email!`
            );

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
