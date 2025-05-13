document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.getElementById("signupName").value;
            const email = document.getElementById("signupEmail").value;
            const password = document.getElementById("signupPassword").value;
            const confirmPassword = document.getElementById("signupConfirmPassword").value;

            if (!name || !email || !password || !confirmPassword) {
                alert("Please fill in all fields.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match. Please try again.");
                return;
            }

            // In a real application, send data to server to create a new account
            alert("Signup successful! Redirecting to login page...");
            window.location.href = "login.html";
        });
    }

    document.querySelectorAll(".footer-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            alert("This feature is coming soon!");
        });
    });
});
