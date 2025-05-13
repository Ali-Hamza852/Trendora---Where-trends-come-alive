$(document).ready(() => {
    // Forgot Password Form
    if ($("#forgot-password-form").length) {
        $("#forgot-password-form").on("submit", (e) => {
            e.preventDefault()

            const email = $("#email").val()
            const messageContainer = $("#message-container")

            // Clear previous messages
            messageContainer.empty()

            // Show loading message
            messageContainer.html('<div class="alert alert-info">Sending password reset email...</div>')

            // Send request to API
            $.ajax({
                url: "/api/auth/forgot-password",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ email }),
                   success: (response) => {
                       messageContainer.html(`<div class="alert alert-success">${response.message}</div>`)
                       $("#forgot-password-form")[0].reset()
                   },
                   error: (xhr) => {
                       const error = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred. Please try again."
                       messageContainer.html(`<div class="alert alert-danger">${error}</div>`)
                   },
            })
        })
    }

    // Reset Password Form
    if ($("#reset-password-form").length) {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get("token")

        if (token) {
            $("#token").val(token)
        } else {
            $("#message-container").html(
                '<div class="alert alert-danger">Invalid or missing reset token. Please request a new password reset link.</div>',
            )
            $("#reset-password-form").hide()
        }

        $("#reset-password-form").on("submit", (e) => {
            e.preventDefault()

            const password = $("#password").val()
            const confirmPassword = $("#confirmPassword").val()
            const token = $("#token").val()
            const messageContainer = $("#message-container")

            // Clear previous messages
            messageContainer.empty()

            // Validate passwords match
            if (password !== confirmPassword) {
                messageContainer.html('<div class="alert alert-danger">Passwords do not match</div>')
                return
            }

            // Show loading message
            messageContainer.html('<div class="alert alert-info">Resetting password...</div>')

            // Send request to API
            $.ajax({
                url: `/api/auth/reset-password/${token}`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ password }),
                   success: (response) => {
                       messageContainer.html(`<div class="alert alert-success">${response.message}</div>`)
                       $("#reset-password-form")[0].reset()

                       // Redirect to login page after 3 seconds
                       setTimeout(() => {
                           window.location.href = "/login"
                       }, 3000)
                   },
                   error: (xhr) => {
                       const error = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred. Please try again."
                       messageContainer.html(`<div class="alert alert-danger">${error}</div>`)
                   },
            })
        })
    }
})
