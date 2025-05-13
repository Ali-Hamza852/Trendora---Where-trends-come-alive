$(document).ready(() => {
    // Login Form
    $("#login-form").on("submit", (e) => {
        e.preventDefault()

        const email = $("#email").val()
        const password = $("#password").val()
        const messageContainer = $("#message-container")

        // Clear previous messages
        messageContainer.empty()

        // Show loading message
        messageContainer.html('<div class="alert alert-info">Logging in...</div>')

        // Get guest cart ID if exists
        const guestCartId = getCookie("guestCartId")

        // Send login request
        $.ajax({
            url: "/api/auth/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                email,
                password,
                guestCartId: guestCartId || undefined,
            }),
            success: (response) => {
                messageContainer.html('<div class="alert alert-success">Login successful! Redirecting...</div>')

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

                // Redirect to home page or previous page
                const redirectUrl = getParameterByName("redirect") || "/"
                setTimeout(() => {
                    window.location.href = redirectUrl
                }, 1000)
            },
            error: (xhr) => {
                const error = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred. Please try again."
                messageContainer.html(`<div class="alert alert-danger">${error}</div>`)
            },
        })
    })

    // Helper function to get URL parameters
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[[\]]/g, "\\$&")
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                  results = regex.exec(url)
                  if (!results) return null
                      if (!results[2]) return ""
                          return decodeURIComponent(results[2].replace(/\+/g, " "))
    }

    // Helper function to get cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
    }
})
