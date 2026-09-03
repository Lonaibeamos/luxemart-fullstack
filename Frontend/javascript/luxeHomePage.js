// This For Profile Icon Container
document.addEventListener("DOMContentLoaded", () => {

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    const authContainer = document.getElementById("authContainer");
    const userProfile = document.getElementById("userProfile");

    if (isLoggedIn === "true") {

        if (authContainer) authContainer.style.display = "none";
        if (userProfile) userProfile.style.display = "flex";

        // 🔥 ADD THIS PART HERE (RIGHT INSIDE LOGIN CHECK)
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");

        const userNameEl = document.getElementById("userName");
        const userEmailEl = document.getElementById("userEmail");
        const userImgEl = document.querySelector(".userImg");

        if (userName && userNameEl) {
            userNameEl.textContent = userName;
        }

        if (userEmail && userEmailEl) {
            userEmailEl.textContent = userEmail;
        }

        if (userName && userImgEl) {
            const initials = userName
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase();

            userImgEl.textContent = initials;
        }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const userProfile = document.getElementById("userProfile");
    const profileContainer = document.getElementById("profileMenu");

    if (userProfile && profileContainer) {
        userProfile.addEventListener("click", (e) => {
            e.stopPropagation();
            profileContainer.classList.toggle("active");
        });

        document.addEventListener("click", () => {
            profileContainer.classList.remove("active");
        });
    }
});

document.getElementById("loginBtn").addEventListener('click' , ()=>{
    window.location.href = '/luxemart-fullstack/Frontend/html/luxeLoginPage.html';
})

document.getElementById("signupBtn").addEventListener('click' , ()=>{
    window.location.href = '/luxemart-fullstack/Frontend/html/luxeSignupPage.html';
})

document.getElementById("shopCollection").addEventListener('click' , ()=>{
    window.location.href = '/luxemart-fullstack/Frontend/html/luxeProductListPage.html';
})


document.getElementById("cartIcon").addEventListener('click' , ()=>{
    window.location.href = "/luxemart-fullstack/Frontend/html/luxeProductCartPage.html"
})
let allProducts = [];

fetch("https://luxemart.rf.gd/Backend/api/products.php")
.then(res => res.json())
.then(data => {

    console.log("RAW DATA:", data);

    allProducts = data.data || data;

    console.log("PRODUCTS:", allProducts);

    const featured = getOnePerCategory(allProducts, 4);

    console.log("FEATURED:", featured);

    displayFeaturedProducts(featured);
})
.catch(err => {
    console.log("Error:", err);
});


// 🔥 GET ONLY 1 PRODUCT PER CATEGORY (MAX LIMIT = 4)
function getOnePerCategory(products, limit = 4) {

    const seenCategories = new Set();
    const result = [];

    for (let product of products) {

        if (!seenCategories.has(product.category)) {
            seenCategories.add(product.category);
            result.push(product);
        }

        if (result.length === limit) break;
    }

    return result;
}


// 🔥 DISPLAY PRODUCTS
function displayFeaturedProducts(products) {

    const container = document.getElementById("featuredContainer");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `
            <div class="featuredProductCard">

                <div class="featuredProductCardImg">
                    <img src="../assets/img/luxeProductList/${product.image}" alt="${product.name}">
                </div>

                <div class="featuredProductCardDescription">

                    <p class="fPCCategory">${product.category}</p>

                    <p class="fPCName">${product.name}</p>

                    <p class="fPCPrice">
                        $${product.price}
                        <span class="fPCDiscount">$${product.discount || 0}</span>
                    </p>

                    <button class="addingToCart" data-id="${product.id}">Add to Cart</button>

                </div>

            </div>
        `;
    });
}

const cartNotification = document.querySelector(".cartNotification");

// =========================
// LOAD CART COUNT
// =========================
async function updateCartNotification() {

    const userId = localStorage.getItem("userId");

    if (!userId) {

        if (cartNotification) {
            cartNotification.textContent = "0";
        }

        return;
    }

    try {

        const res = await fetch(
            `https://luxemart.rf.gd/Backend/api/get_cart.php?user_id=${userId}`
        );

        const cartItems = await res.json();

        console.log("CART ITEMS:", cartItems);

        let totalItems = 0;

        cartItems.forEach(item => {
            totalItems += Number(item.quantity);
        });

        if (cartNotification) {
            cartNotification.textContent = totalItems;
        }

    } catch (error) {

        console.log("Cart Error:", error);

        if (cartNotification) {
            cartNotification.textContent = "0";
        }
    }
}

// =========================
// LOAD NOTIFICATION ON PAGE LOAD
// =========================
document.addEventListener("DOMContentLoaded", () => {
    updateCartNotification();
});


// =========================
// ADD TO CART
// =========================
document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("addingToCart")) return;

    const userId = localStorage.getItem("userId");

    if (!userId) {

        showToast("Please login first", "error");
        return;
    }

    const productId = Number(e.target.dataset.id);

    try {

        const res = await fetch(
            "https://luxemart.rf.gd/Backend/api/add_cart.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    quantity: 1
                })
            }
        );

        const data = await res.json();

        console.log("ADD CART RESPONSE:", data);

        if (data.status === "success") {

            showToast(data.message, "success");

            // refresh notification immediately
            await updateCartNotification();

        } else {

            showToast(data.message || "Failed to add product", "error");
        }

    } catch (error) {

        console.log("ADD CART ERROR:", error);

        showToast("Failed to add product", "error");
    }
});

function showToast(message, type) {

    const toast = document.createElement("div");

    toast.textContent = message;

    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.zIndex = "9999";

    toast.style.background =
        type === "success" ? "green" : "red";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    const profileMenu = document.getElementById("profileMenu");
    const authContainer = document.getElementById("authContainer");
    const userProfile = document.getElementById("userProfile");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            // 1. Clear login state
            localStorage.removeItem("isLoggedIn");

            // 2. Optional: clear user data
            localStorage.removeItem("user");
            localStorage.removeItem("cart");

            // 3. Reset UI
            if (authContainer) authContainer.style.display = "flex";
            if (userProfile) userProfile.style.display = "none";

            // 4. Close profile menu
            if (profileMenu) profileMenu.classList.remove("active");

            // 5. Reset cart badge
            const cartNotification = document.querySelector(".cartNotification");
            if (cartNotification) cartNotification.textContent = "0";

            // 6. Redirect (optional but good UX)
            window.location.href = "/luxemart-fullstack/Frontend/html/luxeHomePage.html";
        });
    }
});

// For profile Container
document.addEventListener("DOMContentLoaded", () => {

    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    const userImg = localStorage.getItem("profileImg");

    const nameEl = document.querySelector(".userProfileName");
    const imgEl = document.querySelector(".userProfileInfoContainer img");

    // set name
    if (nameEl && userName) {
        nameEl.textContent = userName;
    }

    // set image
    if (imgEl && userImg) {
        imgEl.src = userImg;
    }

    // fallback if image missing
    if (imgEl && !userImg) {
        imgEl.src = "../assets/img/luxeProductCollection/profile img.jpg";
    }
});

const userDashboardBtn = document.getElementById("userProfileDashboardBtn");
const userRecentBtn = document.getElementById("userProfileRecentBtn");
const userProSettingBtn = document.getElementById("userProfileSettingBtn");

const dashboardContainer = document.getElementById("userProfilePageOption_1");
const recentContainer = document.getElementById("userProfilePageOption_2");
const profileSettingContainer = document.getElementById("userProfilePageOption_3");

function hideUserProfileOptionContainer(){
    dashboardContainer.classList.remove("show");
    recentContainer.classList.remove("show");
    profileSettingContainer.classList.remove("show");
}


userDashboardBtn.addEventListener("click" , ()=>{
    hideUserProfileOptionContainer();
    dashboardContainer.classList.add("show");
})

userRecentBtn.addEventListener("click" , ()=>{
    hideUserProfileOptionContainer();
    recentContainer.classList.add("show");
})

userProSettingBtn.addEventListener("click" , ()=>{
    hideUserProfileOptionContainer();
    profileSettingContainer.classList.add("show");
})

document.addEventListener("DOMContentLoaded", () => {

    const userId = localStorage.getItem("userId");

    const totalOrderBox = document.querySelector("#userProfilePageOption_1 .userProfileOrderNumbers p");
    const ordersContainer = document.querySelector("#userProfilePageOption_2 .userProfilePageOrderDetails");

    if (!userId) return;

    fetch(`https://luxemart.rf.gd/Backend/api/get_user_dashboard_full.php?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {

            console.log("DASHBOARD DATA:", data);

            if (data.status === "success") {

                // =========================
                // 1. TOTAL ORDERS
                // =========================
                if (totalOrderBox) {
                    totalOrderBox.textContent = data.total_orders;
                }

                // =========================
                // 2. USER ORDERS LIST
                // =========================
                if (ordersContainer) {

                    ordersContainer.innerHTML = "";

                    data.orders.forEach(order => {

                        ordersContainer.innerHTML += `
                            <div class="userProfileOrderPageCard">

                                <div class="userProfileOrderPageCardImg">
                                    <img src="../assets/img/luxeProductList/${order.image}" />
                                </div>

                                <div class="userProfileOrderpageCardDetails">

                                    <p>Order #${order.order_id}</p>
                                    <p>${order.name}</p>

                                    <div class="userProfilePgaeOrderDateAndPrice">
                                        <p>${order.created_at}</p>
                                        <p>$${order.product_price}</p>
                                    </div>

                                </div>

                            </div>
                        `;
                    });
                }
            }

        })
        .catch(err => {
            console.log("ERROR:", err);
        });

});


// btn of the  profile container
const profileContainer = document.getElementById("userProfilePageConatiner");

function hideAllPages() {
    dashboardContainer.classList.remove("show");
    recentContainer.classList.remove("show");
    profileSettingContainer.classList.remove("show");
}

document.getElementById("myProfileBtn").addEventListener("click", () => {

    profileContainer.style.display = "block";

    hideAllPages();
    dashboardContainer.classList.add("show");

});

document.getElementById("myOrdersBtn").addEventListener("click", () => {

    profileContainer.style.display = "block";

    hideAllPages();
    recentContainer.classList.add("show");

});

document.getElementById("settingBtn").addEventListener("click", () => {

    profileContainer.style.display = "block";

    hideAllPages();
    profileSettingContainer.classList.add("show");

});

let originalUser = {};

document.addEventListener("DOMContentLoaded", async () => {

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const res = await fetch(
            "https://luxemart.rf.gd/Backend/api/get_customers.php"
        );

        const data = await res.json();

        const user = data.find(u => Number(u.id) === Number(userId));

        if (!user) return;

        // ✅ SAVE ORIGINAL DATA (IMPORTANT FIX)
        originalUser = {
            fullname: user.fullname || "",
            email: user.email || "",
            phone: user.phone || "",
            password : user.password || ""
        };

        // fill inputs (USE SAME IDS ALWAYS)
        document.getElementById("profileUserName").value = originalUser.fullname;
        document.getElementById("profileUserEmail").value = originalUser.email;
        document.getElementById("profileUserPhoneNumber").value = originalUser.phone;

        // header
        document.querySelector(".userProfileName").textContent = user.fullname;

        const img = document.querySelector(".userProfileInfoContainer img");
        if (img) {
            img.src = user.profile_img
                ? `../assets/img/${user.profile_img}`
                : "../assets/img/default.png";
        }

    } catch (error) {
        console.error(error);
    }
});


document.querySelector(".saveChangeBtn").addEventListener("click", async () => {

    const userId = localStorage.getItem("userId");

    const fullname = document.getElementById("profileUserName").value;
    const email = document.getElementById("profileUserEmail").value;
    const phone = document.getElementById("profileUserPhoneNumber").value;

    const current_password = document.getElementById("userCurrentPassword").value;
    const new_password = document.getElementById("userNewPassword").value;

    const payload = {
        user_id: userId,
        fullname,
        email,
        phone
    };

    // ONLY send password if user typed it
    if (current_password && new_password) {
        payload.current_password = current_password;
        payload.new_password = new_password;
    }

    const res = await fetch(
        "https://luxemart.rf.gd/Backend/api/update_user.php",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await res.json();

    if (data.status === "success") {
        showToast("Profile updated successfully" , 'success');

        // clear password inputs
        document.getElementById("userCurrentPassword").value = "";
        document.getElementById("userNewPassword").value = "";

    } else {
        alert(data.message || "Update failed");
    }
});

document.querySelector(".discardChangeBtn").addEventListener("click", () => {

    document.getElementById("profileUserName").value =
        originalUser.fullname || "";

    document.getElementById("profileUserEmail").value =
        originalUser.email || "";

    document.getElementById("profileUserPhoneNumber").value =
        originalUser.phone || "";

    document.getElementById("userCurrentPassword").value = "";
    document.getElementById("userNewPassword").value = "";

    showToast("Changes reverted" , 'success');
});

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.querySelector(".userPofilePageLogoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            // 1. REMOVE USER SESSION DATA
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("profileImg");
            localStorage.removeItem("cart");

            // 2. OPTIONAL: show message
            alert("Logged out successfully");

            // 3. REDIRECT TO HOME PAGE
            window.location.href =
                "/luxemart-fullstack/Frontend/html/luxeHomePage.html";

            profileContainer.style.display = "none";
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const closeBtn = document.querySelector(".userProfilePageCloseIcon");
    const profileContainer = document.querySelector(".userProfilePageConatiner");

    if (closeBtn && profileContainer) {
        closeBtn.addEventListener("click", () => {

            profileContainer.style.display = "none";

        });
    }
});