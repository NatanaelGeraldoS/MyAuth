import { showBootstrapToast } from "./util.js";

const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById("loadingOverlay").classList.remove("d-none");
    let isValid = true;
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const dobInput = document.getElementById("dob");
    const genderInputs = document.querySelectorAll("[name='gender']");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");

    // Name validation
    if (nameInput.value.trim().length < 2) {
        nameInput.classList.add("is-invalid");
        nameInput.classList.remove("is-valid");
        isValid = false;
    } else {
        nameInput.classList.add("is-valid");
        nameInput.classList.remove("is-invalid");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        emailInput.classList.remove("is-valid");
        isValid = false;
    } else {
        emailInput.classList.add("is-valid");
        emailInput.classList.remove("is-invalid");
    }

    // Date of Birth validation
    const dob = new Date(dobInput.value);
    if (!dob || dob > new Date()) {
        dobInput.classList.add("is-invalid");
        dobInput.classList.remove("is-valid");
        isValid = false;
    } else {
        dobInput.classList.add("is-valid");
        dobInput.classList.remove("is-invalid");
    }

    // Gender validation
    let genderValue = "";
    let genderSelected = false;
    genderInputs.forEach((gender) => {
        if (gender.checked) {
            genderSelected = true;
            genderValue = gender.value;
        }
    });

    if (!genderSelected) {
        document.querySelector(".gender-error").classList.remove("d-none"); // Show error message
        isValid = false;
    } else {
        document.querySelector(".gender-error").classList.add("d-none"); // Hide error message
    }

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

    const informationRegister = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        dob: dobInput.value,
        gender: genderValue,
        password: passwordInput.value,
    };
    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(informationRegister),
        });

        const result = await response.json();

        if (response.status === 201) {
            showBootstrapToast(`Registration Successful!`);
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } else {
            showBootstrapToast(
                `Registration Failed: ${result.message}`,
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
