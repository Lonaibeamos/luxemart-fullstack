let cart = [];

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadCheckoutCart();
});


// ===============================
// LOAD CART FROM BACKEND (FIXED)
// ===============================
async function loadCheckoutCart() {

    const userId = localStorage.getItem("userId");

    if (!userId) return;

    try {

        const res = await fetch(
            "https://luxemart.rf.gd/Backend/api/get_cart.php?user_id=" + userId
        );

        const data = await res.json();

        // IMPORTANT FIX
        cart = Array.isArray(data) ? data : [];

        console.log("CART FROM BACKEND:", cart);

        displayCartItems();
        updateCartNotification();
        updateOrderSummary();

    } catch (error) {
        console.log("ERROR:", error);
    }
}


// ===============================
// DISPLAY CART ITEMS (UNCHANGED UI)
// ===============================
function displayCartItems() {

    const cartContainer = document.getElementById("cartItemsContainer");

    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = `<h2>Your Cart is Empty</h2>`;
        return;
    }

    cart.forEach((item, index) => {

        cartContainer.innerHTML += `
            <div class="cartItem">

                <div class="itemImgContainer">
                    <img src="../assets/img/luxeProductList/${item.image}" alt="${item.name}">
                </div>

                <div class="cartItemDescription">

                    <div class="cartItemNamePrice">
                        <p class="itemName">${item.name}</p>
                        <p class="itemPrice">$${Number(item.price).toFixed(2)}</p>
                    </div>

                    <div class="itemQuantity">

                        <div class="itemQuantityDescrement"
                            onclick="decreaseQuantity(${item.cart_id})">
                            <i class="fa-solid fa-minus"></i>
                        </div>

                        <div class="itemNumberQuantity">
                            ${item.quantity}
                        </div>

                        <div class="itemQuantityIncrement"
                            onclick="increaseQuantity(${item.cart_id})">
                            <i class="fa-solid fa-plus"></i>
                        </div>

                    </div>

                    <div class="removeItem">
                        <p class="remove" onclick="removeItem(${item.cart_id})">
                            Remove
                        </p>
                    </div>

                </div>

            </div>
        `;
    });
}


// INCREASE QUANTITY (BACKEND SAFE)


window.increaseQuantity = function(cartId) {

    fetch("https://luxemart.rf.gd/Backend/api/update_cart_quantity.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            cart_id: cartId,
            action: "increase"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            loadCheckoutCart(); // reload from DB
        } else {
            console.log(data.message);
        }
    })
    .catch(err => console.log(err));
};


// ===============================
// DECREASE QUANTITY
// ===============================
// window.decreaseQuantity = function(cartId) {

//     let item = cart.find(i => i.cart_id == cartId);

//     if (!item) return;

//     if (item.quantity > 1) {
//         item.quantity = Number(item.quantity) - 1;
//     }

//     saveCart();
// };

window.decreaseQuantity = function(cartId) {

    fetch("https://luxemart.rf.gd/Backend/api/update_cart_quantity.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            cart_id: cartId,
            action: "decrease"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            loadCheckoutCart();
        } else {
            console.log(data.message);
        }
    })
    .catch(err => console.log(err));
};


// ===============================
// REMOVE ITEM
// ===============================
window.removeItem = async function(cartId) {

    try {

        const res = await fetch(
            "https://luxemart.rf.gd/Backend/api/delete_cart_item.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cart_id: cartId
                })
            }
        );

        const data = await res.json();

        if (data.status === "success") {

            // remove locally AFTER DB success
            cart = cart.filter(i => i.cart_id != cartId);

            saveCart();

        } else {
            alert(data.message);
        }

    } catch (error) {
        console.log("DELETE ERROR:", error);
    }
};


// ===============================
// SAVE CART (UI ONLY VERSION)
// ===============================
function saveCart() {

    displayCartItems();
    updateCartNotification();
    updateOrderSummary();

    console.log("UPDATED CART:", cart);
}


// ===============================
// CART BADGE
// ===============================
function updateCartNotification() {

    const badge = document.querySelector(".cartNotification");

    if (!badge) return;

    let total = cart.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
    }, 0);

    badge.textContent = total;
}


// ===============================
// ORDER SUMMARY
// ===============================
function updateOrderSummary() {

    const subTotalEl = document.getElementById("subTotal");
    const taxEl = document.getElementById("taxAmount");
    const totalEl = document.getElementById("totalAmount");
    const numberofItem = document.querySelector(".numberofItem");

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {

        let price = Number(item.price || 0);
        let qty = Number(item.quantity || 0);

        subtotal += price * qty;
        totalItems += qty;
    });

    let tax = subtotal * 0.1;
    let total = subtotal + tax;

    if (numberofItem) {
        numberofItem.textContent = `You Have ${totalItems} item(s) in your cart`;
    }

    if (subTotalEl) subTotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // PAYMENT TOGGLE SAFE VERSION
    // ===============================
    const bankOption = document.getElementById("bankOption");
    const cashOption = document.getElementById("cashOption");

    const bankCard = document.querySelector(".paymentOptioncardBankTransfer");
    const cashCard = document.querySelector(".paymentOptioncardCash");

    if (bankOption && cashOption && bankCard && cashCard) {

        function showBank() {
            bankOption.classList.add("active");
            cashOption.classList.remove("active");

            bankCard.classList.add("show");
            cashCard.classList.remove("show");
        }

        function showCash() {
            cashOption.classList.add("active");
            bankOption.classList.remove("active");

            cashCard.classList.add("show");
            bankCard.classList.remove("show");
        }

        bankOption.addEventListener("click", showBank);
        cashOption.addEventListener("click", showCash);

        showBank(); // default
    }

    // ===============================
    // CONTINUE BUTTON FIX
    // ===============================
    const continueBtn = document.getElementById("continueBtn");

    if (continueBtn) {
        continueBtn.addEventListener("click", function(e) {
            e.preventDefault();

            window.location.href =
                "/luxemart-fullstack/Frontend/html/luxeCheckoutPage.html";
        });
    }

});