let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ============================
// 1. LOAD PRODUCTS
// ============================
fetch("http://localhost/smart-ecommerce-app/Backend/api/products.php")
.then(res => res.json())
.then(products => {

    allProducts = products;

    console.log("ALL PRODUCTS LOADED:", allProducts);

    updateCartNotificationFromBackend();

    // PRODUCT LIST PAGE
    if (document.getElementById("productContainer")) {
        displayProducts(allProducts);
        setupFilters();
        updateCategoryCounts();
    }

    // PRODUCT DETAIL PAGE
    if (document.getElementById("productDetailsContainer")) {
        displayProductDetails();
    }
});

updateCartNotificationFromBackend()

// ============================
// 2. DISPLAY PRODUCTS (LIST)
// ============================
function displayProducts(products) {

    const container = document.getElementById("productContainer");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `
        <div class="luxeProductListCard">
          <div class="productImgContainer" onclick="goToProductDetails(${product.id})">
            <img class="productImg" src="../assets/img/luxeProductList/${product.image}" alt="product img">
          </div>

          <div class="productDetails">
            <p class="productCategory">${product.category}</p>
            <h3 class="productName">${product.name}</h3>

            <div class="starReview">
              <i class="fa-regular fa-star"></i>
              <i class="fa-regular fa-star"></i>
              <i class="fa-regular fa-star"></i>
              <i class="fa-regular fa-star"></i>
              <i class="fa-regular fa-star"></i>
              <span class="reviewCount">(${product.rating} reviews)</span>
            </div>

            <div class="priceandAddcartContainer">
              <p class="productPrice">$${product.price}</p> 
              <div class="addBtn" onclick="addToCart(${product.id})">
                <i class="fa-solid fa-cart-plus"></i>
              </div>
            </div>
          </div>
        </div>
        `;
    });
}


// ============================
// 3. GO TO DETAIL PAGE
// ============================
window.goToProductDetails = function(id){
    window.location.href =
    `luxeProductDetailPage.html?id=${id}`;
};


// ============================
// 4. ADD TO CART (LIST PAGE)
// ============================
window.addToCart = async function(productId){

    const userId = localStorage.getItem("userId");

    console.log("CLICKED PRODUCT:", productId);
    console.log("USER ID:", userId);

    try{

        const res = await fetch(
            "http://localhost/smart-ecommerce-app/Backend/api/add_cart.php",
            {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    quantity: 1
                })
            }
        );

        const text = await res.text();
        console.log("RAW RESPONSE:", text);

        const data = JSON.parse(text);
        console.log("PARSED DATA:", data);

        if(data.status === "success"){
            updateCartNotificationFromBackend();
            showToast("Product added to cart");

            let badge = document.querySelector(".cartNotification");

            if(badge){
                let current = Number(badge.textContent) || 0;
                badge.textContent = current + 1;
            }
        }else{
            showToast(data.message);
        }

    }catch(error){
        console.log("ERROR CAUGHT:", error);
        showToast("Server error");
    }
};


// 3. SETUP FILTERS
function setupFilters() {

    const searchInput = document.getElementById("searchInput");
    const checkboxes = document.querySelectorAll("input[name='category']");
    const minInput = document.getElementById("minPrice");
    const maxInput = document.getElementById("maxPrice");

    // SEARCH
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    // CATEGORY
    checkboxes.forEach(cb => {
        cb.addEventListener("change", applyFilters);
    });

    // PRICE
    minInput.addEventListener("input", applyFilters);
    maxInput.addEventListener("input", applyFilters);
}

// 4. APPLY FILTERS (FIXED VERSION)
function applyFilters() {

    let searchValue = (document.getElementById("searchInput").value || "").toLowerCase();

    let selectedCategories = [];

    document.querySelectorAll("input[name='category']").forEach(cb => {
        if (cb.checked && cb.value) {
            selectedCategories.push(cb.value.toLowerCase());
        }
    });

    let allChecked = document.querySelector("#category1").checked;

    let min = parseFloat(document.getElementById("minPrice").value) || 0;
    let max = parseFloat(document.getElementById("maxPrice").value) || Infinity;

    let filtered = allProducts.filter(product => {

        let name = (product.name || "").toLowerCase();
        let category = (product.category || "").toLowerCase();
        let desc = (product.description || "").toLowerCase();
        let price = parseFloat(product.price);

        let searchMatch =
            searchValue === "" ||
            name.includes(searchValue) ||
            category.includes(searchValue) ||
            desc.includes(searchValue);

        let categoryMatch =
            allChecked ||
            selectedCategories.length === 0 ||
            selectedCategories.includes(category);

        let priceMatch =
            price >= min && price <= max;

        return searchMatch && categoryMatch && priceMatch;
    });

    console.log("FILTERED RESULT:", filtered);

    displayProducts(filtered);
}

// 5. CATEGORY COUNTS
function updateCategoryCounts() {

    document.querySelector(".numberofProductOne").textContent = allProducts.length;

    document.querySelector(".numberofProductTwo").textContent =
        allProducts.filter(p => p.category.toLowerCase() === "smartphones").length;

    document.querySelector(".numberofProductThree").textContent =
        allProducts.filter(p => p.category.toLowerCase() === "computers").length;

    document.querySelector(".numberofProductFour").textContent =
        allProducts.filter(p => p.category.toLowerCase() === "computer components").length;

    document.querySelector(".numberofProductFive").textContent =
        allProducts.filter(p => p.category.toLowerCase() === "accessories").length;

    document.querySelector(".numberofProductSix").textContent =
        allProducts.filter(p => p.category.toLowerCase() === "watches").length;

    document.querySelector(".numberofProductSeven").textContent =
        allProducts.filter(p => p.category.toLowerCase() === "audio devices").length;
}


// ============================
// 5. PRODUCT DETAIL PAGE
// ============================
function displayProductDetails(){

    const detailContainer = document.getElementById("productDetailsContainer");


    if(!detailContainer)return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const product = allProducts.find(p => p.id == productId);

    // IF PRODUCT NOT FOUND
    if(!product){

        detailContainer.innerHTML =
        `<h1>Product Not Found</h1>`;

        return;
    }
    
    detailContainer.innerHTML = `
        <div class = "productDetailImgCard">
            <img src="../assets/img/luxeProductList/${product.image}" alt="image of products detail">
        </div>
        <div class="productDetailDescription">
            <h1>${product.name}</h1>
            <div class="starReview">
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <span class="reviewCount">
                    (${product.rating} reviews)
                </span>
                <p class="separating">|</p>
                <span class="checkingStock">In Stock</span>
            </div>

            <p class="productPrice">
                $${product.price}
            </p>
            <p class="ProductDescription">
                ${product.description}
            </p>
            <div class="productQuantity">
                <h3>Quantity</h3>
                <div class="quantityCount">
                    <div class="quantityDescrement">
                        <i class="fa-solid fa-minus"></i>
                    </div>

                    <div class="numberOfQuantity">1</div>

                    <div class="quantityIncrement">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                </div>
            </div>
            <button type="submit" id="addToCartBtn">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Add to Cart</p>
            </button>
        </div>
    `;

    setupQuantityControls();

    const addBtn = document.getElementById("addToCartBtn");

    addBtn.addEventListener("click", async function () {

        const userId = localStorage.getItem("userId");

        const quantity = Number(
            document.querySelector(".numberOfQuantity").textContent
        );

        console.log("DETAIL ADD PRODUCT:", product.id);
        console.log("USER ID:", userId);
        console.log("QUANTITY:", quantity);

        try {

            const res = await fetch(
                "http://localhost/smart-ecommerce-app/Backend/api/add_cart.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        product_id: product.id,
                        quantity: quantity
                    })
                }
            );

            const text = await res.text();
            console.log("RAW RESPONSE:", text);

            const data = JSON.parse(text);
            console.log("PARSED DATA:", data);

            if (data.status === "success") {

                // IMPORTANT: update badge from backend
                updateCartNotificationFromBackend();

                showToast(`${product.name} added to cart`);

            } else {
                showToast(data.message);
            }

        } catch (error) {
            console.log("ERROR:", error);
            showToast("Server error");
        }
    });
}


// ============================
// 6. QUANTITY CONTROL
// ============================
function setupQuantityControls(){

    let qty = 1;

    const minus = document.querySelector(".quantityDescrement");
    const plus = document.querySelector(".quantityIncrement");
    const display = document.querySelector(".numberOfQuantity");

    if(!minus || !plus || !display) return;

    minus.addEventListener("click", () => {
        if(qty > 1){
            qty--;
            display.textContent = qty;
        }
    });

    plus.addEventListener("click", () => {
        qty++;
        display.textContent = qty;
    });
}

// ============================
// 8. CART ICON NAVIGATION
// ============================
async function updateCartNotificationFromBackend() {

    const userId = localStorage.getItem("userId");

    if (!userId) return;

    try {

        const res = await fetch(
            "http://localhost/smart-ecommerce-app/Backend/api/get_cart.php?user_id=" + userId
        );

        const data = await res.json();

        // FIX: ensure array
        const cart = Array.isArray(data) ? data : [];

        let total = cart.reduce((sum, item) => {
            return sum + Number(item.quantity || 0);
        }, 0);

        const badge = document.querySelector(".cartNotification");

        if (badge) {
            badge.textContent = total;
        }

    } catch (error) {
        console.log("BADGE ERROR:", error);
    }
}

document.addEventListener("click", function(e){

    if(e.target.closest(".cartIcon")){
        window.location.href =
        "luxeProductCartPage.html";
    }
});


function showToast(message){

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}