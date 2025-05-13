const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    userId: String,
    productId: String,
    size: String,
    color: String,
    quantity: Number,
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Cart", cartSchema)

// Shopping cart functionality
document.addEventListener("DOMContentLoaded", () => {
    // Initialize cart
    initializeCart()

    // Add event listeners to add to cart buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", handleAddToCart)
    })

    // Add event listeners to cart quantity buttons
    const cartQuantityInputs = document.querySelectorAll(".cart-quantity-input")
    cartQuantityInputs.forEach((input) => {
        input.addEventListener("change", updateCartItemQuantity)
    })

    // Add event listeners to remove from cart buttons
    const removeFromCartButtons = document.querySelectorAll(".cart-remove-btn")
    removeFromCartButtons.forEach((button) => {
        button.addEventListener("click", removeFromCart)
    })

    // Add event listener to checkout button
    const checkoutButton = document.querySelector(".checkout-btn")
    if (checkoutButton) {
        checkoutButton.addEventListener("click", proceedToCheckout)
    }
})

// Initialize cart
function initializeCart() {
    // Get cart from localStorage or initialize empty cart
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    // Update cart icon count
    updateCartCount(cart.length)

    // If on cart page, render cart items
    const cartItemsContainer = document.querySelector(".cart-items")
    if (cartItemsContainer) {
        renderCartItems(cart, cartItemsContainer)
        updateCartTotals(cart)
    }
}

// Handle add to cart
function handleAddToCart(e) {
    e.preventDefault()

    // Get product details
    const productCard = this.closest(".product")
    if (!productCard) return

        const productId = productCard.dataset.productId
        const productName = productCard.querySelector(".product-name a").textContent
        const productPrice = Number.parseFloat(productCard.querySelector(".product-price").textContent.replace("$", ""))
        const productImage = productCard.querySelector(".product-img img").src

        // Get quantity (default to 1 if not specified)
        const quantityInput = productCard.querySelector(".product-quantity")
        const quantity = quantityInput ? Number.parseInt(quantityInput.value) : 1

        // Add to cart
        addToCart({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity,
        })

        // Show success message
        showToast(`${productName} added to cart!`, "success")

        // Add animation to cart icon
        animateCartIcon()
}

// Add to cart
function addToCart(product) {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    // Check if product already in cart
    const existingProductIndex = cart.findIndex((item) => item.id === product.id)

    if (existingProductIndex !== -1) {
        // Update quantity if product already in cart
        cart[existingProductIndex].quantity += product.quantity
    } else {
        // Add new product to cart
        cart.push(product)
    }

    // Save updated cart
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count
    updateCartCount(cart.length)

    // If on cart page, update cart display
    const cartItemsContainer = document.querySelector(".cart-items")
    if (cartItemsContainer) {
        renderCartItems(cart, cartItemsContainer)
        updateCartTotals(cart)
    }
}

// Update cart item quantity
function updateCartItemQuantity() {
    const quantity = Number.parseInt(this.value)
    const productId = this.closest(".cart-item").dataset.productId

    // Get current cart
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    // Find product in cart
    const productIndex = cart.findIndex((item) => item.id === productId)

    if (productIndex !== -1) {
        // Update quantity
        cart[productIndex].quantity = quantity

        // Remove item if quantity is 0
        if (quantity <= 0) {
            cart.splice(productIndex, 1)
        }

        // Save updated cart
        localStorage.setItem("cart", JSON.stringify(cart))

        // Update cart display
        const cartItemsContainer = document.querySelector(".cart-items")
        if (cartItemsContainer) {
            renderCartItems(cart, cartItemsContainer)
            updateCartTotals(cart)
        }

        // Update cart count
        updateCartCount(cart.length)
    }
}

// Remove from cart
function removeFromCart(e) {
    e.preventDefault()

    const productId = this.closest(".cart-item").dataset.productId

    // Get current cart
    let cart = JSON.parse(localStorage.getItem("cart")) || []

    // Remove product from cart
    cart = cart.filter((item) => item.id !== productId)

    // Save updated cart
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart display
    const cartItemsContainer = document.querySelector(".cart-items")
    if (cartItemsContainer) {
        renderCartItems(cart, cartItemsContainer)
        updateCartTotals(cart)
    }

    // Update cart count
    updateCartCount(cart.length)

    // Show message
    showToast("Item removed from cart", "info")
}

// Render cart items
function renderCartItems(cart, container) {
    // Clear container
    container.innerHTML = ""

    if (cart.length === 0) {
        // Show empty cart message
        container.innerHTML = `
        <div class="empty-cart">
        <i class="fa fa-shopping-cart fa-4x"></i>
        <p>Your cart is empty</p>
        <a href="/store" class="primary-btn">Continue Shopping</a>
        </div>
        `
        return
    }

    // Render each cart item
    cart.forEach((item) => {
        const cartItemElement = document.createElement("div")
        cartItemElement.className = "cart-item"
        cartItemElement.dataset.productId = item.id

        cartItemElement.innerHTML = `
        <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
        <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1">
        </div>
        <div class="cart-item-total">
        $${(item.price * item.quantity).toFixed(2)}
        </div>
        <div class="cart-item-actions">
        <button class="cart-remove-btn"><i class="fa fa-trash"></i></button>
        </div>
        `

        container.appendChild(cartItemElement)

        // Add event listeners to new elements
        cartItemElement.querySelector(".cart-quantity-input").addEventListener("change", updateCartItemQuantity)
        cartItemElement.querySelector(".cart-remove-btn").addEventListener("click", removeFromCart)
    })
}

// Update cart totals
function updateCartTotals(cart) {
    const subtotalElement = document.querySelector(".cart-subtotal")
    const taxElement = document.querySelector(".cart-tax")
    const shippingElement = document.querySelector(".cart-shipping")
    const totalElement = document.querySelector(".cart-total")

    if (!subtotalElement || !totalElement) return

        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

        // Calculate tax (10%)
        const tax = subtotal * 0.1

        // Calculate shipping (free over $100, otherwise $10)
        const shipping = subtotal > 100 ? 0 : 10

        // Calculate total
        const total = subtotal + tax + shipping

        // Update elements
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`
        if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`
            if (shippingElement) shippingElement.textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`
                totalElement.textContent = `$${total.toFixed(2)}`
}

// Update cart count
function updateCartCount(count) {
    const cartCountElements = document.querySelectorAll(".cart-count, .qty")
    cartCountElements.forEach((element) => {
        element.textContent = count

        // Hide if count is 0
        if (count === 0) {
            element.style.display = "none"
        } else {
            element.style.display = "block"
        }
    })
}

// Animate cart icon
function animateCartIcon() {
    const cartIcon = document.querySelector(".header-ctn .fa-shopping-cart")
    if (!cartIcon) return

        // Add animation class
        cartIcon.classList.add("cart-icon-animate")

        // Remove animation class after animation completes
        setTimeout(() => {
            cartIcon.classList.remove("cart-icon-animate")
        }, 500)
}

// Proceed to checkout
function proceedToCheckout(e) {
    e.preventDefault()

    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
        // Redirect to login page with return URL
        window.location.href = `/login?redirect=${encodeURIComponent("/checkout")}`
        return
    }

    // Redirect to checkout page
    window.location.href = "/checkout"
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
