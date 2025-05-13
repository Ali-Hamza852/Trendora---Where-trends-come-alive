document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("resetEmail").value;

            if (!email) {
                alert("Please enter your email address.");
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
});
