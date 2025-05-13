document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            // In a real application, send data to server for authentication
            alert("Login successful! Redirecting to your account...");
            window.location.href = "index.html";
        });
    }

    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const closeModal = document.querySelector(".close");
    const backToLogin = document.getElementById("backToLogin");

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (event) => {
            event.preventDefault();
            forgotPasswordModal.style.display = "block";
        });
    }

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            forgotPasswordModal.style.display = "none";
        });
    }

    if (backToLogin) {
        backToLogin.addEventListener("click", (event) => {
            event.preventDefault();
            forgotPasswordModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = "none";
        }
    });

    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("resetEmail").value;

            if (!email) {
                alert("Please enter your email.");
                return;
            }

            try {
                const response = await fetch("/api/password-reset", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                    forgotPasswordModal.style.display = "none";
                                            forgotPasswordForm.reset();
                } else {
                    alert(data.message || "Failed to send password reset email. Please try again later.");
                }
            } catch (error) {
                console.error("Error requesting password reset:", error);
                alert("An error occurred. Please try again later.");
            }
        });
    }

    document.querySelectorAll(".footer-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            alert("This feature is coming soon!");
        });
    });
});
