import $ from "jquery"

$(document).ready(() => {
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on("click", function (event) {
        var target = $(this.getAttribute("href"))
        if (target.length) {
            event.preventDefault()
            $("html, body")
            .stop()
            .animate(
                {
                    scrollTop: target.offset().top - 100,
                },
                1000,
            )
        }
    })

    // Animation for team members on scroll
    $(window)
    .scroll(function () {
        var windowBottom = $(this).scrollTop() + $(this).innerHeight()

        $(".team-member").each(function () {
            var objectBottom = $(this).offset().top + $(this).outerHeight()

            if (objectBottom < windowBottom) {
                if ($(this).css("opacity") == 0) {
                    $(this).fadeTo(500, 1)
                }
            }
        })
    })
    .scroll()

    // Initialize team members with opacity 0
    $(".team-member").css("opacity", 0)
})
