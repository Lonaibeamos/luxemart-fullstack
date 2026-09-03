const pay_btn = document.getElementById("payBtn");

const bankOption = document.getElementById("bankOption");
const cashOption = document.getElementById("cashOption");

const bankCard = document.querySelector(".paymentOptioncardBankTransfer");
const cashCard = document.querySelector(".paymentOptioncardCash");

let paymentMethod = "bank";

// DEFAULT VIEW (IMPORTANT)
bankCard.classList.add("show");
cashCard.classList.remove("show");

bankOption.addEventListener("click", () => {

    paymentMethod = "bank";

    bankCard.classList.add("show");
    cashCard.classList.remove("show");

    bankOption.classList.add("active");
    cashOption.classList.remove("active");
});

cashOption.addEventListener("click", () => {

    paymentMethod = "cash";

    cashCard.classList.add("show");
    bankCard.classList.remove("show");

    cashOption.classList.add("active");
    bankOption.classList.remove("active");
});

document.addEventListener("DOMContentLoaded", () => {
    loadCheckoutCart();
});


pay_btn.addEventListener("click", async () => {

    const userId = localStorage.getItem("userId");

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const streetAddress = document.getElementById("streetAddress").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value;

    // ✅ receipt input
    const receiptInput = document.getElementById("receiptImage");
    const receiptFile = receiptInput ? receiptInput.files[0] : null;

    // ===============================
    // VALIDATION (shipping)
    // ===============================
    if (
        !firstName ||
        !lastName ||
        !streetAddress ||
        !city ||
        !state
    ) {
        showToast("Please fill all shipping fields", "error");
        return;
    }

    // ===============================
    // VALIDATION (BANK ONLY)
    // ===============================
    if (paymentMethod === "bank" && !receiptFile) {
        showToast("Please upload your bank receipt", "error");
        return;
    }

    // ===============================
    // BUILD DATA
    // ===============================
    const formData = new FormData();

    formData.append("user_id", userId);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("street_address", streetAddress);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("payment_method", paymentMethod);

    // only send receipt if bank
    if (paymentMethod === "bank") {
        formData.append("receipt", receiptFile);
    }

    try {

        pay_btn.disabled = true;
        pay_btn.innerHTML = "Processing...";

        const res = await fetch(
            "http://localhost/smart-ecommerce-app/Backend/api/orders.php",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();

        console.log("ORDER RESPONSE:", data);

        if (data.status === "success") {
            showToast("Order placed successfully!", "success");

            // AFTER ORDER SUCCESS → CREATE TRANSACTION
            const transactionData = new FormData();

            transactionData.append("order_id", data.order_id);
            transactionData.append("user_id", userId);
            transactionData.append("amount", data.total || 0);
            transactionData.append("payment_method", paymentMethod);

            const txRes = await fetch(
                "http://localhost/smart-ecommerce-app/Backend/api/transactions.php",
                {
                    method: "POST",
                    body: transactionData
                }
            );

            const text = await txRes.text();
            console.log("RAW TX RESPONSE:", text);

            const txData = JSON.parse(text);

            if (txData.status === "success") {

                fetch(`http://localhost/smart-ecommerce-app/Backend/api/get_transaction.php?user_id=${userId}`)
                .then(res => res.json())
                .then(transactionInfo => {

                    console.log("RAW TRANSACTION INFO:", transactionInfo);

                    // ✅ FIX: use data object directly
                    const latestTransaction = transactionInfo.data;

                    if (!latestTransaction) {
                        console.log("NO TRANSACTION FOUND");
                        return;
                    }

                    setTimeout(() => {
                        displayTransactionData(latestTransaction);
                    }, 3000);

                });

                } else {
                    alert("Transaction failed: " + txData.message);
                }
        } else {
            alert(data.message || "Order failed");
        }


    } catch (error) {
        console.log("ERROR:", error);
        alert("Server error");

    } finally {
        pay_btn.disabled = false;
        pay_btn.innerHTML = `<i class="fa-solid fa-lock"></i> complete Payment`;
    }
});


function renderOrderItems(cart) {

    const container = document.getElementById("orderItemsContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(cart) || cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    cart.forEach(item => {

        let qty = Number(item.quantity) || 1;
        let price = Number(item.price) || 0;
        let total = qty * price;

        container.innerHTML += `
            <div class="orderItem">

                <img src="../assets/img/luxeProductList/${item.image}" />

                <div class="orderItemDetails">
                    <p><strong>${item.name}</strong></p>

                    <!-- CLEAR QUANTITY DISPLAY -->
                    <p>
                        ${qty} × $${price.toFixed(2)} = 
                        <strong>$${total.toFixed(2)}</strong>
                    </p>

                </div>

            </div>
        `;
    });
}

function updateSummary(cart) {

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {

        let price = Number(item.price) || 0;
        let qty = Number(item.quantity) || 0;

        subtotal += price * qty;
        totalItems += qty;
    });

    let tax = subtotal * 0.1;
    let total = subtotal + tax;

    document.getElementById("subTotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("taxAmount").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("totalAmount").textContent = `$${total.toFixed(2)}`;
}

async function loadCheckoutCart() {

    const userId = localStorage.getItem("userId");

    if (!userId) return;

    try {

        const res = await fetch(
            "http://localhost/smart-ecommerce-app/Backend/api/get_cart.php?user_id=" + userId
        );

        const cart = await res.json();

        console.log("CHECKOUT CART:", cart);
        console.log("RAW CART FROM BACKEND:", cart);

        renderOrderItems(cart);
        updateSummary(cart);

    } catch (error) {
        console.log("ERROR LOADING CART:", error);
    }
}

function showToast(message, type = "info") {

    const container = document.getElementById("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");

    toast.classList.add("toast", type);
    toast.textContent = message;

    container.appendChild(toast);

    // auto remove after 3s
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const transactionConatiner =
    document.getElementById("transactionCardContainer");

function displayTransactionData(transaction){

    if(!transactionConatiner) return;

    transactionConatiner.style.display = "block";

    transactionConatiner.innerHTML = `
        <div class="correctIcon">
            <i class="fa-solid fa-check"></i>
        </div>

        <div class="transactionTitles">
            <h2>Order Confirmed!</h2>

            <p>
                Thank you for shopping with LuxeCommerce.
                Your payment has been received successfully and your order is now being processed.
            </p>
        </div>

        <div class="transctionCardDetails">

            <div class="transactionHeader">
                <h3>Transaction Summary</h3>
            </div>

            <div class="transactionRow">
                <span>Order ID</span>
                <strong>#${transaction.order_id}</strong>
            </div>

            <div class="transactionRow">
                <span>Total Amount</span>
                <strong>$${transaction.total_amount}</strong>
            </div>

            <div class="transactionRow">
                <span>Payment Method</span>
                <strong>${transaction.payment_method}</strong>
            </div>

            <div class="transactionRow">
                <span>Status</span>
                <strong class="successStatus">${transaction.status}</strong>
            </div>

        </div>

        <button class="continueShoppingBtn" id="continueShoppingBtn">
            Continue Shopping
        </button>

        <p class="securedText">
            Secured by <span>LuxeCommerce</span>
        </p>
    `;

    document.getElementById("continueShoppingBtn")
        .addEventListener("click", () => {
            window.location.href =
            "/luxemart-fullstack/Frontend/html/luxeProductListPage.html";
        });
}
