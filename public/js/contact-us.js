$(document).ready(() => {
    // Form validation and submission
    $("#contactForm").on("submit", function (e) {
        e.preventDefault();

        // Get form values
        const name = $("#name").val();
        const email = $("#email").val();
        const subject = $("#subject").val();
        const message = $("#message").val();

        // Simple validation
        if (!name.trim() || !email.trim() || !message.trim()) {
            alert("Please fill in all required fields");
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return false;
        }

        // Send form data to server
        $.ajax({
            url: "/api/contact",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ name, email, subject, message }),
               success: function (data) {
                   if (data.success) {
                       alert(data.message);
                       $("#contactForm")[0].reset();
                   } else {
                       alert(data.message || "Failed to send message. Please try again later.");
                   }
               },
               error: function (error) {
                   console.error("Error sending contact form:", error);
                   alert("An error occurred. Please try again later.");
               },
        });
    });

    // FAQ accordion functionality
    $(".faq-item h4").on("click", function () {
        $(this).next("p").slideToggle(300);
        $(this).parent().toggleClass("active");
    });

    // Initialize FAQ items with hidden paragraphs
    $(".faq-item p").hide();

    // Animate info items on scroll
    $(window)
    .scroll(function () {
        const windowBottom = $(this).scrollTop() + $(this).innerHeight();

        $(".info-item").each(function () {
            const objectBottom = $(this).offset().top + $(this).outerHeight();

            if (objectBottom < windowBottom) {
                if ($(this).css("opacity") == 0) {
                    $(this).fadeTo(500, 1);
                }
            }
        });
    })
    .scroll();

    // Initialize info items with opacity 0
    $(".info-item").css("opacity", 0);
});
