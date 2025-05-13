// Authentication functionality
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    checkAuthStatus()

    // Handle signup form
    const signupForm = document.getElementById("signupForm")
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup)
    }

    // Handle login form
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin)
    }

    // Handle forgot password form
    const forgotPasswordForm = document.getElementById("forgotPasswordForm")
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", handleForgotPassword)
    }

    // Handle reset password form
    const resetPasswordForm = document.getElementById("resetPasswordForm")
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", handleResetPassword)
    }

    // Handle logout
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout)
    }

    // Handle profile update form
    const profileUpdateForm = document.getElementById("profileUpdateForm")
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener("submit", handleProfileUpdate)
    }

    // Handle password update form
    const passwordUpdateForm = document.getElementById("passwordUpdateForm")
    if (passwordUpdateForm) {
        passwordUpdateForm.addEventListener("submit", handlePasswordUpdate)
    }
})

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem("token")
    const userInfo = localStorage.getItem("userInfo")

    if (token && userInfo) {
        // User is logged in
        updateUIForLoggedInUser(JSON.parse(userInfo))

        // Fetch latest user data from server
        fetchUserData(token)
    } else {
        // User is not logged in
        updateUIForLoggedOutUser()
    }
}

// Fetch user data from server
async function fetchUserData(token) {
    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            // If response is not ok, user might be unauthorized
            if (response.status === 401) {
                // Clear local storage and update UI
                localStorage.removeItem("token")
                localStorage.removeItem("userInfo")
                updateUIForLoggedOutUser()
                return
            }
            throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()

        // Update local storage with latest user data
        localStorage.setItem(
            "userInfo",
            JSON.stringify({
                id: userData._id,
                name: userData.name,
                email: userData.email,
                isAdmin: userData.isAdmin,
                phone: userData.phone,
                address: userData.address,
                city: userData.city,
                postalCode: userData.postalCode,
                country: userData.country,
            }),
        )

        // Update UI with latest user data
        updateUIForLoggedInUser(userData)

        // Populate user data on account page
        populateUserData(userData)
    } catch (error) {
        console.error("Error fetching user data:", error)
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    // Update account link
    const accountLinks = document.querySelectorAll(".account-link")
    if (accountLinks) {
        accountLinks.forEach((link) => {
            link.innerHTML = `<i class="fa fa-user-o"></i> ${user.name}`
            link.href = "/account"
        })
    }

    // Show logout button
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block"
    }

    // Update any user-specific elements
    const userNameElements = document.querySelectorAll(".user-name")
    if (userNameElements) {
        userNameElements.forEach((el) => {
            el.textContent = user.name
        })
    }

    // If on account page, populate user data
    populateUserData(user)
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    // Update account link
    const accountLinks = document.querySelectorAll(".account-link")
    if (accountLinks) {
        accountLinks.forEach((link) => {
            link.innerHTML = '<i class="fa fa-user-o"></i> My Account'
            link.href = "/login"
        })
    }

    // Hide logout button
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
        logoutBtn.style.display = "none"
    }

    // If on account page, redirect to login
    if (window.location.pathname === "/account") {
        window.location.href = "/login"
    }
}

// Populate user data on account page
function populateUserData(user) {
    const accountPage = document.querySelector(".account-page")
    if (!accountPage) return

        const userNameField = document.getElementById("userName")
        const userEmailField = document.getElementById("userEmail")
        const userPhoneField = document.getElementById("userPhone")
        const userAddressField = document.getElementById("userAddress")
        const userCityField = document.getElementById("userCity")
        const userPostalCodeField = document.getElementById("userPostalCode")
        const userCountryField = document.getElementById("userCountry")

        if (userNameField) userNameField.value = user.name || ""
            if (userEmailField) userEmailField.value = user.email || ""
                if (userPhoneField) userPhoneField.value = user.phone || ""
                    if (userAddressField) userAddressField.value = user.address || ""
                        if (userCityField) userCityField.value = user.city || ""
                            if (userPostalCodeField) userPostalCodeField.value = user.postalCode || ""
                                if (userCountryField) userCountryField.value = user.country || ""
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault()

    // Show loading
    showLoading()

    // Get form data
    const name = document.getElementById("signupName").value
    const email = document.getElementById("signupEmail").value
    const password = document.getElementById("signupPassword").value
    const confirmPassword = document.getElementById("signupConfirmPassword").value

    // Validate passwords match
    if (password !== confirmPassword) {
        hideLoading()
        showAlert("Passwords do not match", "danger")
        return
    }

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Signup failed")
        }

        // Save token and user info
        localStorage.setItem("token", data.token)
        localStorage.setItem(
            "userInfo",
            JSON.stringify({
                id: data._id,
                name: data.name,
                email: data.email,
                isAdmin: data.isAdmin,
            }),
        )

        // Show success message
        showAlert("Signup successful! Redirecting...", "success")

        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = "/"
        }, 2000)
    } catch (error) {
        showAlert(error.message, "danger")
    } finally {
        hideLoading()
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault()

    // Show loading
    showLoading()

    // Get form data
    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Login failed")
        }

        // Save token and user info
        localStorage.setItem("token", data.token)
        localStorage.setItem(
            "userInfo",
            JSON.stringify({
                id: data._id,
                name: data.name,
                email: data.email,
                isAdmin: data.isAdmin,
            }),
        )

        // Show success message
        showAlert("Login successful! Redirecting...", "success")

        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = "/"
        }, 2000)
    } catch (error) {
        showAlert(error.message, "danger")
    } finally {
        hideLoading()
    }
}

// Handle forgot password form submission
async function handleForgotPassword(e) {
    e.preventDefault()

    // Show loading
    showLoading()

    // Get form data
    const email = document.getElementById("resetEmail").value

    try {
        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to send reset email")
        }

        // Show success message
        showAlert("Password reset email sent! Please check your inbox.", "success")
    } catch (error) {
        showAlert(error.message, "danger")
    } finally {
        hideLoading()
    }
}

// Handle reset password form submission
async function handleResetPassword(e) {
    e.preventDefault()

    // Show loading
    showLoading()

    // Get form data
    const password = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")

    if (!token) {
        hideLoading()
        showAlert("Invalid or missing reset token", "danger")
        return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        hideLoading()
        showAlert("Passwords do not match", "danger")
        return
    }

    try {
        const response = await fetch(`/api/auth/reset-password/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to reset password")
        }

        // Show success message
        showAlert("Password reset successful! Redirecting to login...", "success")

        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = "/login"
        }, 2000)
    } catch (error) {
        showAlert(error.message, "danger")
    } finally {
        hideLoading()
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault()

    // Show loading
    showLoading()

    // Get form data
    const name = document.getElementById("userName").value
    const email = document.getElementById("userEmail").value
    const phone = document.getElementById("userPhone").value
    const address = document.getElementById("userAddress").value
    const city = document.getElementById("userCity").value
    const postalCode = document.getElementById("userPostalCode").value
    const country = document.getElementById("userCountry").value

    try {
        const token = localStorage.getItem("token")
        if (!token) {
            throw new Error("You must be logged in to update your profile")
        }

        const response = await fetch("/api/auth/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                address,
                city,
                postalCode,
                country,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update profile")
        }

        // Update user info in local storage
        const userInfo = JSON.parse(localStorage.getItem("userInfo"))
        userInfo.name = data.name
        userInfo.email = data.email
        userInfo.phone = data.phone
        userInfo.address = data.address
        userInfo.city = data.city
        userInfo.postalCode = data.postalCode
        userInfo.country = data.country
        localStorage.setItem("userInfo", JSON.stringify(userInfo))

        // Update UI
        updateUIForLoggedInUser(userInfo)

        // Show success message
        showAlert("Profile updated successfully", "success")
    } catch (error) {
        showAlert(error.message, "danger")
    } finally {
        hideLoading()
    }
}

// Handle password update
async function handlePasswordUpdate(e) {
    e.preventDefault()

    // Show loading
    showLoading()

    // Get form data
    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        hideLoading()
        showAlert("New passwords do not match", "danger")
        return
    }

    try {
        const token = localStorage.getItem("token")
        if (!token) {
            throw new Error("You must be logged in to update your password")
        }

        const response = await fetch("/api/auth/update-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update password")
        }

        // Show success message
        showAlert("Password updated successfully", "success")

        // Clear form
        document.getElementById("currentPassword").value = ""
        document.getElementById("newPassword").value = ""
        document.getElementById("confirmPassword").value = ""
    } catch (error) {
        showAlert(error.message, "danger")
    } finally {
        hideLoading()
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault()

    try {
        // Call logout API
        await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })

        // Clear local storage
        localStorage.removeItem("token")
        localStorage.removeItem("userInfo")

        // Show success message
        showAlert("Logged out successfully", "success")

        // Update UI
        updateUIForLoggedOutUser()

        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = "/"
        }, 2000)
    } catch (error) {
        console.error("Logout error:", error)

        // Even if API call fails, clear local storage and redirect
        localStorage.removeItem("token")
        localStorage.removeItem("userInfo")
        window.location.href = "/"
    }
}

// Show loading overlay
function showLoading() {
    // Check if loading overlay already exists
    if (document.querySelector(".loading-overlay")) return

        const loadingOverlay = document.createElement("div")
        loadingOverlay.className = "loading-overlay"

        const spinner = document.createElement("div")
        spinner.className = "loading-spinner"

        loadingOverlay.appendChild(spinner)
        document.body.appendChild(loadingOverlay)
}

// Hide loading overlay
function hideLoading() {
    const loadingOverlay = document.querySelector(".loading-overlay")
    if (loadingOverlay) {
        loadingOverlay.remove()
    }
}

// Show alert message
function showAlert(message, type) {
    // Remove any existing alerts
    const existingAlert = document.querySelector(".alert")
    if (existingAlert) {
        existingAlert.remove()
    }

    // Create alert element
    const alertElement = document.createElement("div")
    alertElement.className = `alert alert-${type}`
    alertElement.textContent = message

    // Add close button
    const closeButton = document.createElement("button")
    closeButton.type = "button"
    closeButton.className = "close"
    closeButton.innerHTML = "&times;"
    closeButton.addEventListener("click", () => alertElement.remove())

    alertElement.appendChild(closeButton)

    // Find the form to insert the alert before
    const form = document.querySelector("form")
    if (form) {
        form.parentNode.insertBefore(alertElement, form)
    } else {
        // If no form, insert at the beginning of the main content
        const mainContent = document.querySelector(".section") || document.body
        mainContent.insertBefore(alertElement, mainContent.firstChild)
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove()
        }
    }, 5000)
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
