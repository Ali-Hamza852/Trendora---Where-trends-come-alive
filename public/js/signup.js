$(document).ready(() => {
    // Signup Form
    $("#signup-form").on("submit", (e) => {
        e.preventDefault()

        const name = $("#name").val()
        const email = $("#email").val()
        const password = $("#password").val()
        const confirmPassword = $("#confirmPassword").val()
        const messageContainer = $("#message-container")

        // Clear previous messages
        messageContainer.empty()

        // Validate passwords match
        if (password !== confirmPassword) {
            messageContainer.html('<div class="alert alert-danger">Passwords do not match</div>')
            return
        }

        // Show loading message
        messageContainer.html('<div class="alert alert-info">Creating your account...</div>')

        // Get guest cart ID if exists
        const guestCartId = getCookie("guestCartId")

        // Send registration request
        $.ajax({
            url: "/api/auth/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                name,
                email,
                password,
                guestCartId: guestCartId || undefined,
            }),
            success: (response) => {
                messageContainer.html(`<div class="alert alert-success">${response.message}</div>`)

                // Store user info in localStorage
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: response._id,
                        name: response.name,
                        email: response.email,
                        isAdmin: response.isAdmin,
                        isVerified: response.isVerified,
                    }),
                )

                // Redirect to home page after 3 seconds
                setTimeout(() => {
                    window.location.href = "/"
                }, 3000)
            },
            error: (xhr) => {
                const error = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred. Please try again."
                messageContainer.html(`<div class="alert alert-danger">${error}</div>`)
            },
        })
    })

    // Helper function to get cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
    }
})
