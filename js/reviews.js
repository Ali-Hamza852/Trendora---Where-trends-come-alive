$(document).ready(function() {
    $('#reviewForm').on('submit', function(e) {
        e.preventDefault();

        const productId = 'trendy-summer-dress'; // Hardcoded for this product
        const name = $('input[name="name"]').val();
        const email = $('input[name="email"]').val();
        const review = $('textarea[name="review"]').val();
        const rating = $('input[name="rating"]:checked').val();

        $.ajax({
            url: '/api/reviews',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ productId, name, email, review, rating }),
               success: function(response) {
                   alert('Thank you for your review!');
                   $('#reviewForm')[0].reset();
               },
               error: function(xhr) {
                   alert('Error: ' + (xhr.responseJSON?.error || 'Unable to submit review. Please try again.'));
               }
        });
    });
});
