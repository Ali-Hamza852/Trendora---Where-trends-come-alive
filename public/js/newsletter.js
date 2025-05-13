// Newsletter functionality
document.addEventListener("DOMContentLoaded", () => {
    const newsletterForm = document.getElementById("newsletterForm")

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", handleNewsletterSubmit)
    }
})

// Handle newsletter form submission
async function handleNewsletterSubmit(e) {
    e.preventDefault()

    // Get email
    const emailInput = document.getElementById("newsletterEmail")
    const email = emailInput.value

    // Validate email
    if (!validateEmail(email)) {
        showToast("Please enter a valid email address", "error")
        return
    }

    try {
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]')
        let originalBtnText = "" // Declare originalBtnText
        if (submitBtn) {
            originalBtnText = submitBtn.innerHTML
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Subscribing...'
            submitBtn.disabled = true
        }

        // Submit to API
        const response = await fetch("/api/newsletter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to subscribe")
        }

        // Show success message
        showToast("Thank you for subscribing to our newsletter!", "success")

        // Reset form
        this.reset()
    } catch (error) {
        showToast(error.message, "error")
    } finally {
        // Restore button state
        const submitBtn = this.querySelector('button[type="submit"]')
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText
            submitBtn.disabled = false
        }
    }
}

// Validate email format
function validateEmail(email) {
    const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}

// Show toast notification
function showToast(message, type) {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector(".toast-container")
    if (!toastContainer) {
        toastContainer = document.createElement("div")
        toastContainer.className = "toast-container"
        document.body.appendChild(toastContainer)
    }

    // Create toast element
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`

    // Add icon based on type
    let icon = ""
    switch (type) {
        case "success":
            icon = "fa-check-circle"
            break
        case "error":
            icon = "fa-exclamation-circle"
            break
        case "info":
            icon = "fa-info-circle"
            break
        case "warning":
            icon = "fa-exclamation-triangle"
            break
    }

    toast.innerHTML = `
    <div class="toast-icon"><i class="fa ${icon}"></i></div>
    <div class="toast-message">${message}</div>
    <button class="toast-close">&times;</button>
    `

    // Add to container
    toastContainer.appendChild(toast)

    // Add event listener to close button
    toast.querySelector(".toast-close").addEventListener("click", () => {
        toast.remove()
    })

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove()
        }
    }, 5000)
}
