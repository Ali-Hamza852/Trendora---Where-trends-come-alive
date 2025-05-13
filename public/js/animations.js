// Enhanced animations and transitions for the e-commerce site
document.addEventListener("DOMContentLoaded", () => {
    // Initialize animations
    initializeAnimations()

    // Add scroll animations
    addScrollAnimations()

    // Add hover effects
    addHoverEffects()

    // Add page transition effects
    addPageTransitions()

    // Initialize product image zoom
    initializeProductZoom()

    // Initialize countdown timer
    initializeCountdownTimer()
})

// Initialize animations
function initializeAnimations() {
    // Animate header on scroll
    window.addEventListener("scroll", () => {
        const header = document.getElementById("header")
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add("header-scrolled")
            } else {
                header.classList.remove("header-scrolled")
            }
        }
    })

    // Animate product cards on hover
    const products = document.querySelectorAll(".product")
    products.forEach((product) => {
        product.addEventListener("mouseenter", function () {
            this.classList.add("product-hover")
        })

        product.addEventListener("mouseleave", function () {
            this.classList.remove("product-hover")
        })
    })

    // Animate add to cart button
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn")
    addToCartBtns.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault()

            // Add animation class
            this.classList.add("btn-clicked")

            // Show toast notification
            showToast("Product added to cart!", "success")

            // Remove animation class after animation completes
            setTimeout(() => {
                this.classList.remove("btn-clicked")
            }, 300)
        })
    })
}

// Add scroll animations
function addScrollAnimations() {
    // Get all elements that should be animated on scroll
    const animatedElements = document.querySelectorAll(".animate-on-scroll")

    // Create intersection observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animated")
                }
            })
        },
        {
            threshold: 0.1,
        },
    )

    // Observe each element
    animatedElements.forEach((element) => {
        observer.observe(element)
    })

    // Add animation classes to sections
    const sections = document.querySelectorAll(".section")
    sections.forEach((section, index) => {
        section.classList.add("animate-on-scroll")
        section.style.animationDelay = `${index * 0.1}s`
    })
}

// Add hover effects
function addHoverEffects() {
    // Add hover effect to navigation links
    const navLinks = document.querySelectorAll(".main-nav > li > a")
    navLinks.forEach((link) => {
        link.addEventListener("mouseenter", function () {
            this.classList.add("nav-link-hover")
        })

        link.addEventListener("mouseleave", function () {
            this.classList.remove("nav-link-hover")
        })
    })

    // Add hover effect to buttons
    const buttons = document.querySelectorAll(".primary-btn, .add-to-cart-btn, .newsletter-btn")
    buttons.forEach((button) => {
        button.addEventListener("mouseenter", function () {
            this.classList.add("btn-hover")
        })

        button.addEventListener("mouseleave", function () {
            this.classList.remove("btn-hover")
        })
    })

    // Add hover effect to product images
    const productImages = document.querySelectorAll(".product-img")
    productImages.forEach((image) => {
        image.addEventListener("mouseenter", function () {
            this.classList.add("product-img-hover")
        })

        image.addEventListener("mouseleave", function () {
            this.classList.remove("product-img-hover")
        })
    })
}

// Add page transitions
function addPageTransitions() {
    // Add transition class to body
    document.body.classList.add("page-transition")

    // Add event listeners to all internal links
    const internalLinks = document.querySelectorAll('a[href^="/"]')
    internalLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            // Skip if modifier keys are pressed
            if (e.metaKey || e.ctrlKey) return

                const href = this.getAttribute("href")

                // Skip for links to the current page
                if (href === window.location.pathname) return

                    // Skip for download links or external links
                    if (this.getAttribute("download") || this.getAttribute("target") === "_blank") return

                        e.preventDefault()

                        // Add exit animation
                        document.body.classList.add("page-transition-exit")

                        // Navigate to the new page after animation completes
                        setTimeout(() => {
                            window.location.href = href
                        }, 300)
        })
    })

    // Add enter animation when page loads
    window.addEventListener("pageshow", () => {
        document.body.classList.add("page-transition-enter")

        setTimeout(() => {
            document.body.classList.remove("page-transition-exit")
            document.body.classList.remove("page-transition-enter")
        }, 500)
    })
}

// Initialize product image zoom
function initializeProductZoom() {
    const productMainImg = document.getElementById("product-main-img")
    if (productMainImg) {
        const zoomContainer = document.createElement("div")
        zoomContainer.className = "zoom-container"

        const zoomLens = document.createElement("div")
        zoomLens.className = "zoom-lens"

        const zoomResult = document.createElement("div")
        zoomResult.className = "zoom-result"

        productMainImg.parentNode.appendChild(zoomContainer)
        zoomContainer.appendChild(zoomLens)
        zoomContainer.appendChild(zoomResult)

        const productImg = productMainImg.querySelector("img")
        if (productImg) {
            productImg.addEventListener("mousemove", function (e) {
                // Calculate cursor position
                const rect = this.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                // Calculate position as percentage
                const xPercent = (x / rect.width) * 100
                const yPercent = (y / rect.height) * 100

                // Position lens
                zoomLens.style.left = `${x - zoomLens.offsetWidth / 2}px`
                zoomLens.style.top = `${y - zoomLens.offsetHeight / 2}px`

                // Show lens and result
                zoomLens.style.display = "block"
                zoomResult.style.display = "block"

                // Set background image and position
                zoomResult.style.backgroundImage = `url(${this.src})`
                zoomResult.style.backgroundPosition = `${xPercent}% ${yPercent}%`
            })

            productImg.addEventListener("mouseleave", () => {
                zoomLens.style.display = "none"
                zoomResult.style.display = "none"
            })
        }
    }
}

// Initialize countdown timer
function initializeCountdownTimer() {
    const countdownElements = document.querySelectorAll(".hot-deal-countdown")

    countdownElements.forEach((countdown) => {
        // Set target date (24 hours from now for demo)
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + 1)

        // Update countdown every second
        const interval = setInterval(() => {
            // Calculate remaining time
            const now = new Date()
            const diff = targetDate - now

            // If countdown is over, clear interval
            if (diff <= 0) {
                clearInterval(interval)
                return
            }

            // Calculate days, hours, minutes, seconds
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            // Update countdown elements
            const dayElement = countdown.querySelector("li:nth-child(1) h3")
            const hourElement = countdown.querySelector("li:nth-child(2) h3")
            const minuteElement = countdown.querySelector("li:nth-child(3) h3")
            const secondElement = countdown.querySelector("li:nth-child(4) h3")

            if (dayElement) dayElement.textContent = days.toString().padStart(2, "0")
                if (hourElement) hourElement.textContent = hours.toString().padStart(2, "0")
                    if (minuteElement) minuteElement.textContent = minutes.toString().padStart(2, "0")
                        if (secondElement) secondElement.textContent = seconds.toString().padStart(2, "0")
        }, 1000)
    })
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
