const toggleBtn = document.createElement("button")
toggleBtn.classList.add("toggle-btn")
toggleBtn.innerHTML = "☰"
document.body.appendChild(toggleBtn)

const sidebar = document.querySelector(".sidebar")
const mainContent = document.querySelector(".main-content")

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")
})

const sections = document.querySelectorAll(".section")
const links = document.querySelectorAll(".sidebar ul li a")

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault()
        const target = document.querySelector(link.getAttribute("href"))
        sections.forEach((section) => section.classList.remove("active"))
        target.classList.add("active")
        links.forEach((l) => l.classList.remove("active"))
        link.classList.add("active")
    })
})

const addProductBtn = document.getElementById("addProductBtn")
const addProductModal = document.getElementById("addProductModal")
const closeModal = document.querySelector(".close")

addProductBtn.addEventListener("click", () => {
    addProductModal.style.display = "block"
})

closeModal.addEventListener("click", () => {
    addProductModal.style.display = "none"
})

window.addEventListener("click", (e) => {
    if (e.target === addProductModal) {
        addProductModal.style.display = "none"
    }
})

document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const productName = document.getElementById("productName").value
    const productPrice = document.getElementById("productPrice").value
    const productStock = document.getElementById("productStock").value

    const productTable = document.getElementById("productTable").getElementsByTagName("tbody")[0]
    const newRow = productTable.insertRow()
    newRow.innerHTML = `
    <td>${productTable.rows.length + 1}</td>
    <td>${productName}</td>
    <td>$${productPrice}</td>
    <td>${productStock}</td>
    <td><button class="editBtn">Edit</button> <button class="deleteBtn">Delete</button></td>
    `
    document.getElementById("addProductForm").reset()
    addProductModal.style.display = "none"
})
document.getElementById("totalProducts").textContent = "10"
document.getElementById("totalOrders").textContent = "25"
document.getElementById("totalUsers").textContent = "150"
const logoutLink = document.getElementById("logoutLink")
const logoutModal = document.getElementById("logoutModal")
const confirmLogout = document.getElementById("confirmLogout")
const cancelLogout = document.getElementById("cancelLogout")
logoutLink.addEventListener("click", (e) => {
    e.preventDefault()
    logoutModal.style.display = "block"
})
document.querySelector("#logoutModal .close").addEventListener("click", () => {
    logoutModal.style.display = "none"
})
confirmLogout.addEventListener("click", () => {
    alert("You have been logged out.")
    logoutModal.style.display = "none"
})
cancelLogout.addEventListener("click", () => {
    logoutModal.style.display = "none"
})
window.addEventListener("click", (e) => {
    if (e.target === logoutModal) {
        logoutModal.style.display = "none"
    }
})
document.getElementById("adminPasswordReset").addEventListener("click", () => {
    const newPassword = prompt("Enter a new password:")
    if (newPassword) {
        fetch("/api/admin/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newPassword }),
        })
        .then((response) => {
            if (response.ok) {
                alert("Password reset successfully!")
            } else {
                alert("Failed to reset password. Please try again.")
            }
        })
        .catch((error) => {
            console.error("Error:", error)
            alert("An error occurred. Please try again.")
        })
    }
})
const allowNewAccounts = document.getElementById("allowNewAccounts")
allowNewAccounts.addEventListener("change", (e) => {
    const isEnabled = e.target.checked
    fetch("/api/settings/allow-new-accounts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: isEnabled }),
    })
    .then((response) => {
        if (!response.ok) {
            alert("Failed to update setting. Please try again.")
            e.target.checked = !isEnabled
        }
    })
    .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again.")
        e.target.checked = !isEnabled
    })
})
const allowPasswordReset = document.getElementById("allowPasswordReset")
allowPasswordReset.addEventListener("change", (e) => {
    const isEnabled = e.target.checked
    fetch("/api/settings/allow-password-reset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: isEnabled }),
    })
    .then((response) => {
        if (!response.ok) {
            alert("Failed to update setting. Please try again.")
            e.target.checked = !isEnabled
        }
    })
    .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again.")
        e.target.checked = !isEnabled
    })
})
