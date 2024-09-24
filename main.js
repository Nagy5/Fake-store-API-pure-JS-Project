async function makePage(page = 1, itemsPerPage = 6) {
    // Using a try-catch block to handle errors during data fetching
    try {
        // Fetching product data from the API
        let res = await fetch("https://fakestoreapi.com/products");
        let data = await res.json();

        /*
            First: 
            The inputs section for filtering and sorting products
        */

        // Create an array to hold the products
        let productArray = [];
        productArray.push(...data);

        // Get user inputs for filtering and sorting
        let search = document.getElementById('search').value.toLowerCase(); // Search term
        let selectedCagegory = document.getElementById('categories').value; // Selected category
        let selectedSort = document.getElementById('sort').value; // Selected sort option
        let minPrice = parseFloat(document.getElementById('minPrice').value) || 0; // Minimum price
        let maxPrice = parseFloat(document.getElementById('maxPrice').value) || 1000; // Maximum price

        // Filter products based on search term, category, and price range
        let filteredArray = productArray.filter(product => {
            let matchSearch = product.title.includes(search); // Check if title includes search term
            let matchCategory = selectedCagegory ? product.category === selectedCagegory : true; // Match category
            let matchMinPrice = product.price >= minPrice; // Match minimum price
            let matchMaxPrice = product.price <= maxPrice; // Match maximum price

            // Return true if all conditions are met
            return matchSearch && matchCategory && matchMinPrice && matchMaxPrice;
        });

        // Sort the filtered products based on selected sort option
        if (selectedSort === 'price-asc') {
            filteredArray.sort((a, b) => a.price - b.price); // Ascending price
        } else if (selectedSort === 'price-desc') {
            filteredArray.sort((a, b) => b.price - a.price); // Descending price
        } else if (selectedSort === 'rating-asc') {
            filteredArray.sort((a, b) => a.rating.rate - b.rating.rate); // Ascending rating
        } else if (selectedSort === 'rating-desc') {
            filteredArray.sort((a, b) => b.rating.rate - a.rating.rate); // Descending rating
        };

        // Select the output and pagination containers
        let outputs = document.querySelector('.outputs');
        let pagination = document.querySelector('.pagination');

        // Clear the pagination container for new buttons
        pagination.innerHTML = '';

        // Calculate total items and pages for pagination
        let totalItems = filteredArray.length; // Total number of filtered items
        let totalPages = Math.ceil(totalItems / itemsPerPage); // Total pages based on items per page

        // Calculate the range of items for the current page
        let start = (page - 1) * itemsPerPage; // Start index
        let end = start + itemsPerPage; // End index
        let itemsOnPage = filteredArray.slice(start, end); // Items to display on the current page

        /*
            Outputs section:
            Creating and displaying product elements on the page,
            including image, title, price, and buttons for 
            viewing descriptions and adding to the cart.
        */

        // Initialize total quantity and total price counters
        let totalq = 0;
        let totalp = 0;

        // Clear previous output
        outputs.innerHTML = '';

        // Loop through the products to create HTML elements
        itemsOnPage.forEach(product => {
            // Create a div for each product
            let productDiv = document.createElement("div");
            productDiv.classList.add("product");

            // Create and append product image
            let image = document.createElement("img");
            image.src = product.image;

            // Create and append product title
            let title = document.createElement('h3');
            title.textContent = product.title;

            // Create and append product price
            let price = document.createElement('p');
            let secPrice = parseFloat(product.price);
            price.textContent = `Price :$${secPrice.toFixed(2)}`; // Format price to two decimal places

            // Select elements to update cart and totals
            let totalQ = document.getElementById('totalQ');
            let totalP = document.getElementById('totalP');
            let cart = document.getElementById('cart');

            // Create modal for displaying product description
            let modal = document.createElement('div');
            modal.classList.add('modal');
            let modalContent = document.createElement('div');
            modalContent.classList.add('modalContent');
            let closeModal = document.createElement('span');
            closeModal.className = 'close';
            closeModal.textContent = 'x'; // Close button

            // Create elements for modal content
            let productImage = document.createElement('img');
            let productTitle = document.createElement('h2');
            let productDesc = document.createElement('p');
            let productCategory = document.createElement('p');
            productCategory.id = "productCategory";
            let productPrice = document.createElement('p');
            productPrice.id = 'productPrice';
            let productRating = document.createElement('p');
            productRating.id = 'productRating';

            // Append modal content elements to the modal
            modalContent.appendChild(closeModal);
            modalContent.appendChild(productImage);
            modalContent.appendChild(productTitle);
            modalContent.appendChild(productDesc);
            modalContent.appendChild(productCategory);
            modalContent.appendChild(productPrice);
            modalContent.appendChild(productRating);
            modal.appendChild(modalContent);

            // Create a container for buttons
            let buttonContainer = document.createElement('div');
            buttonContainer.classList.add('buttonContainer');

            // Create buttons for viewing description and adding to cart
            let descButton = document.createElement('button');
            let cartButton = document.createElement('button');

            descButton.classList.add('descButton');
            cartButton.classList.add('cartButton');

            descButton.textContent = "View Description"; // Description button text
            cartButton.textContent = "Add to Cart"; // Cart button text

            // Event listener for description button to show modal
            descButton.addEventListener("click", () => {
                productImage.src = product.image; // Set image in modal
                productTitle.textContent = product.title; // Set title in modal
                productDesc.textContent = product.description; // Set description in modal
                productCategory.textContent = `Category: ${product.category}`; // Set category in modal
                productPrice.textContent = `Price: ${product.price.toFixed(2)}`; // Set price in modal
                productRating.textContent = `Rating: ${product.rating.rate} (${product.rating.count})`; // Set rating in modal
                modal.style.display = "block"; // Show modal
            });

            let cartItems = {}; // for the cart items to be stored

            // Event listener for cart button to add item to cart
            cartButton.addEventListener("click", () => {
                // Update total price and quantity
                totalP.textContent = (totalp += product.price).toFixed(2); // Update total price
                totalQ.textContent = `${totalq += 1}`; // Update total quantity

                if (cartItems[product.id]) {
                    cartItems[product.id].quantity += 1;
                    cartItems[product.id].addedProduct.textContent = `${product.title} - $${product.price} (x ${cartItems[product.id].quantity})`;
                    cartItems[product.id].cartButton.textContent = `Added! (x ${cartItems[product.id].quantity})`;
                } else {
                    // Create a container for added product in cart
                    let pCartContainer = document.createElement('div');
                    pCartContainer.classList.add('pCartContainer');

                    // Create list item for added product and remove button
                    let addedProduct = document.createElement('li');
                    let remove = document.createElement('button');

                    pCartContainer.appendChild(addedProduct); // Append product info
                    pCartContainer.appendChild(remove); // Append remove button

                    cart.appendChild(pCartContainer); // Add product container to cart

                    // cartButton.textContent = `Added!`; // Change button text to indicate product is added

                    remove.textContent = "Remove"; // Set remove button text
                    remove.addEventListener('click', () => {
                        if (cartItems[product.id].quantity > 1) {
                            // If quantity is greater than 1, just decrement it
                            cartItems[product.id].quantity -= 1; // Decrement quantity
                            totalP.textContent = (totalp -= product.price).toFixed(2); // Update total price
                            totalQ.textContent = `${totalq -= 1}`; // Update total quantity
                            addedProduct.textContent = `${product.title} - $${product.price}  (x${cartItems[product.id].quantity})`; // Update display
                            cartButton.textContent = `Added! (x ${cartItems[product.id].quantity})`;
                        } else {
                            // If quantity is 1, remove the product completely
                            cart.removeChild(pCartContainer); // Remove product from cart
                            totalP.textContent = (totalp -= product.price).toFixed(2); // Update total price
                            totalQ.textContent = `${totalq -= 1}`; // Update total quantity
                            delete cartItems[product.id]; // Remove product from the cartItems object
                            cartButton.textContent = "Add to Cart";
                        };
                    });

                    cartItems[product.id] = {
                        quantity: 1,
                        addedProduct: addedProduct,
                        cartButton: cartButton


                    };

                    addedProduct.textContent = `${product.title} - $${product.price}  (x${cartItems[product.id].quantity})`;
                };

            });

            // Event listener for close modal button
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none'; // Close modal
            });

            // Event listener for window click to close modal if clicked outside
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none'; // Close modal
                };
            });

            // Append buttons to the button container
            buttonContainer.appendChild(descButton);
            buttonContainer.appendChild(cartButton);

            // Append product elements to the product div
            productDiv.appendChild(image);
            productDiv.appendChild(title);
            productDiv.appendChild(price);
            productDiv.appendChild(buttonContainer);

            // Append product div and modal to outputs
            outputs.appendChild(productDiv);
            outputs.appendChild(modal);
        });

        // Create a "Previous" button if not on the first page
        if (page > 1) {
            let prevButton = document.createElement('button');
            prevButton.classList.add('prev');
            prevButton.textContent = 'Previous'; // Set button text
            prevButton.addEventListener('click', () => makePage(page - 1, itemsPerPage)); // Load previous page on click
            pagination.appendChild(prevButton); // Append button to pagination
        }

        // Adding buttons for each page
        for (let i = 1; i <= totalPages; i++) {
            let pageButton = document.createElement('button');
            pageButton.textContent = i; // Set button text to page number
            pageButton.classList.toggle('active', i === page); // Add active class if this is the current page
            pageButton.addEventListener('click', () => makePage(i, itemsPerPage)); // Load selected page on click
            pagination.appendChild(pageButton); // Append button to pagination
        }

        // Create a "Next" button if not on the last page
        if (page < totalPages) {
            let nextButton = document.createElement('button');
            nextButton.classList.add('next');
            nextButton.textContent = 'Next'; // Set button text
            nextButton.addEventListener('click', () => makePage(page + 1, itemsPerPage)); // Load next page on click
            pagination.appendChild(nextButton); // Append button to pagination
        }

    } catch (error) {
        console.error("Error fetching the API:", error); // Log any errors during fetching
    };
}

// Initial call to load the first page of products
makePage();

// Add event listener for "Apply" button to refresh products based on filters
document.getElementById('apply').addEventListener("click", () => {
    makePage(1); // Load first page with applied filters
});


