document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("contactName").value;
            const email = document.getElementById("contactEmail").value;
            const message = document.getElementById("contactMessage").value;

            if (!name || !email || !message) {
                alert("Please fill in all fields");
                return;
            }

            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, message }),
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                    contactForm.reset();
                } else {
                    alert(data.message || "Failed to send message. Please try again later.");
                }
            } catch (error) {
                console.error("Error sending contact form:", error);
                alert("An error occurred. Please try again later.");
            }
        });
    }
});
