document.addEventListener("DOMContentLoaded", () => {
    const orderSubmitBtn = document.querySelector(".order-submit");

    if (orderSubmitBtn) {
        orderSubmitBtn.addEventListener("click", async (event) => {
            event.preventDefault();

            // Check if terms are accepted
            const termsCheckbox = document.getElementById("terms");
            if (!termsCheckbox.checked) {
                alert("Please accept the terms and conditions to place your order.");
                return;
            }

            // Get customer information
            const firstName = document.querySelector('input[name="first-name"]').value;
            const lastName = document.querySelector('input[name="last-name"]').value;
            const email = document.querySelector('input[name="email"]').value;
            const address = document.querySelector('input[name="address"]').value;
            const city = document.querySelector('input[name="city"]').value;
            const country = document.querySelector('input[name="country"]').value;
            const zipCode = document.querySelector('input[name="zip-code"]').value;
            const telephone = document.querySelector('input[name="tel"]').value;

            // Validate required fields
            if (!firstName || !lastName || !email || !address || !city || !country || !zipCode) {
                alert("Please fill in all required fields.");
                return;
            }

            // Get order items (hardcoded for demo; in a real app, fetch from cart/session)
            const orderItems = [
                { name: "Trendy Summer Dress", quantity: 1, price: 49.99 },
                { name: "Wireless Headphones", quantity: 2, price: 79.99 },
            ];

            // Calculate total (hardcoded for demo; in a real app, compute server-side)
            const total = 209.97;

            // Generate a random order number
            const orderNumber = "ORD-" + Math.floor(Math.random() * 1000000);

            try {
                // Send order confirmation email
                const response = await fetch("/api/order-confirmation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderNumber,
                        customerEmail: email,
                        customerName: `${firstName} ${lastName}`,
                        items: orderItems,
                        total,
                        shippingAddress: {
                            street: address,
                            city,
                            state: "", // Not collected in the form
                            zip: zipCode,
                            country,
                        },
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    alert(
                        `Order placed successfully! Order #${orderNumber}. A confirmation email has been sent to ${email}.`
                    );
                    // Optionally redirect to a confirmation page
                    // window.location.href = `/order-confirmation.html?order=${orderNumber}`;
                } else {
                    alert(data.message || "There was a problem processing your order. Please try again.");
                }
            } catch (error) {
                console.error("Error processing order:", error);
                alert("An error occurred while processing your order. Please try again later.");
            }
        });
    }
});
