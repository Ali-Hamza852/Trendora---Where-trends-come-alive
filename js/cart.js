$(document).ready(function() {
    // Main product add to cart
    $('#addToCartForm').on('submit', function(e) {
        e.preventDefault();

        const productId = 'trendy-summer-dress'; // Hardcoded for this product
        const size = $('select[name="size"]').val();
        const color = $('select[name="color"]').val();
        const quantity = $('input[name="quantity"]').val();

        $.ajax({
            url: '/api/cart',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ productId, size, color, quantity }),
               success: function(response) {
                   alert('Product added to cart successfully!');
               },
               error: function(xhr) {
                   alert('Error: ' + (xhr.responseJSON?.error || 'Unable to add to cart. Please try again.'));
               }
        });
    });

    // Related products add to cart
    $('.add-to-cart-btn').on('click', function() {
        const productId = $(this).data('product-id');

        $.ajax({
            url: '/api/cart',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ productId, size: 'M', color: 'Default', quantity: 1 }),
               success: function(response) {
                   alert('Product added to cart successfully!');
               },
               error: function(xhr) {
                   alert('Error: ' + (xhr.responseJSON?.error || 'Unable to add to cart. Please try again.'));
               }
        });
    });
});
