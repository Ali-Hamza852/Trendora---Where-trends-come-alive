document.addEventListener("DOMContentLoaded | () => {
const newsletterForm = document.querySelector("#newsletter form");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                emailInput.value = "";
            } else {
                alert(data.message || "Failed to subscribe. Please try again later.");
            }
        } catch (error) {
            console.error("Error subscribing to newsletter:", error);
            alert("An error occurred. Please try again later.");
        }
    });
}
});
