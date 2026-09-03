const dashboardContainer = document.getElementById("dashboardContentContainer");
const orderContainer = document.getElementById("orderContentContainer");
const inventoryContainer = document.getElementById("inventoryContentConatiner");
const customerContainer = document.getElementById("customerContentContainer");
const revenueContainer = document.getElementById("revenueContentConatiner");

const dashboardBtn = document.getElementById('dashboardBtn');
const orderBtn = document.getElementById('orderBtn');
const inventoryBtn = document.getElementById('inventoryBtn');
const customerBtn = document.getElementById('customerBtn');
const revenueBtn = document.getElementById('revenueBtn'); 

const newProductContainer = document.getElementById("addNewProductContainer");
const closeNewProductBtn = document.getElementById("closeAddProductPopup");
const addNewProductBtn = document.getElementById("addProductBtn");

document.addEventListener("click", (e) => {

    // OPEN POPUP
    if (e.target.closest("#addProductBtn")) {
        document.getElementById("addNewProductContainer")
            .classList.add("show");
    }

    // CLOSE POPUP
    if (e.target.closest("#closeAddProductPopup")) {
        document.getElementById("addNewProductContainer")
            .classList.remove("show");
    }

});


const saveProductBtn = document.getElementById("submitNewProductBtn");

if (saveProductBtn) {

    saveProductBtn.addEventListener("click", async () => {

        const nameInput = document.getElementById("newProduct");
        const descriptionInput = document.getElementById("proDescription");
        const priceInput = document.getElementById("newProductPrice");
        const categoryInput = document.getElementById("newProductCategory");
        const brandInput = document.getElementById("newProductBrand");
        const stockInput = document.getElementById("newProductStock");
        const ratingInput = document.getElementById("newProductRating");
        const featuredInput = document.getElementById("isFeatured");
        const imageInput = document.getElementById("newProductImage");

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const price = priceInput.value;
        const category = categoryInput.value;
        const brand = brandInput.value.trim();
        const stock = stockInput.value;
        const rating = ratingInput.value || 0;
        const isFeatured = featuredInput.checked ? 1 : 0;

        const imageFile = imageInput.files[0];

        if (!name || !price || !category || !imageFile) {
            alert("Please fill all required fields and select an image.");
            return;
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("brand", brand);
        formData.append("stock", stock);
        formData.append("rating", rating);
        formData.append("is_featured", isFeatured);
        formData.append("image", imageFile.name);

        try {

            const res = await fetch(
                "https://luxemart.rf.gd/Backend/api/add_product.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            const text = await res.text();

            console.log("RAW RESPONSE:", text);

            if (!text.trim()) {
                alert("PHP returned an empty response.");
                return;
            }

            const data = JSON.parse(text);

            if (data.status === "success") {

                alert("Product added successfully");

                document.getElementById("addProductForm").reset();

                document.getElementById("imagePreview").style.display = "none";
                document.getElementById("imagePreview").src = "";

                document.getElementById("uploadText").style.display = "block";

                document
                    .getElementById("addNewProductContainer")
                    .classList.remove("show");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error(error);
            alert("Server error");

        }

    });

}

let allCustomers= [];

function  dashboardContainerHide(){
    dashboardContainer.style.display = "none";
}

function hideAll() {
    dashboardContainer.classList.remove("show");
    orderContainer.classList.remove("show");
    inventoryContainer.classList.remove("show");
    customerContainer.classList.remove("show");
    revenueContainer.classList.remove("show");
}

dashboardBtn.addEventListener('click', () => {
    hideAll();
    dashboardContainer.classList.add("show");
});

orderBtn.addEventListener('click', () => {
    hideAll();
    dashboardContainerHide();
    orderContainer.classList.add("show");

});

inventoryBtn.addEventListener('click', () => {
    hideAll();
    dashboardContainerHide();
    inventoryContainer.classList.add("show");
});

customerBtn.addEventListener('click', () => {
    hideAll();
    dashboardContainerHide();
    customerContainer.classList.add("show");
});

revenueBtn.addEventListener('click', () => {
    hideAll();
    dashboardContainerHide();
    revenueContainer.classList.add("show");
});




let allOrders = [];
let allProducts = [];
let allDashboardData = [];
let allRevenuesData = {};
let filteredProducts = [];

fetch("https://luxemart.rf.gd/Backend/api/dashboard.php")
.then(res => res.json())
.then(data => {

    console.log("DASHBOARD DATA:", data);

    allDashboardData = data;

    displayDashboardData(data);
    loadDashboardChart()

})
.catch(error => {
    console.log("FETCH ERROR:", error);
});

function displayDashboardData(data){

    if(!dashboardContainer) return;

    let latestOrders = data.latest_orders || [];
    let recentUsers = data.recent_users || [];
    let products = data.products || [];

    let dashboardRow = "";

    latestOrders.forEach(order => {

        let profileImage = order.profile_img
            ? order.profile_img
            : "../assets/img/luxeProductCollection/profile img.jpg";

        dashboardRow += `
            <tr>
                <td>#ORD-${order.order_id}</td>

                <td class="customer">
                    <img src="${profileImage}" alt="">
                    ${order.fullname || ""}
                </td>

                <td>${order.product_name || ""}</td>

                <td>$${order.total_price || 0}</td>

                <td>
                    <span class="status">${order.status || "pending"}</span>
                </td>

                <td>${order.created_at || ""}</td>
            </tr>
        `;
    });

    let recentActivityHTML = "";

    // ================= NEW ORDER =================
    if (latestOrders.length > 0) {
        let order = latestOrders[0];

        recentActivityHTML += `
            <div class="recentOrders">
                <i class="fa-solid fa-cart-shopping"></i>
                <div class="orderDetails">
                    <p>New Order Placed</p>
                    <span>${order.fullname || "Customer"} - ${order.product_name || "Item"}</span>
                </div>
            </div>
        `;
    }

    // ================= NEW USER =================
    if (recentUsers.length > 0) {
        let user = recentUsers[0];

        recentActivityHTML += `
            <div class="recentUsers">
                <i class="fa-solid fa-user-plus"></i>
                <div class="userDetails">
                    <p>New User Registered</p>
                    <span>${user.fullname || ""} - ${user.created_at || ""}</span>
                </div>
            </div>
        `;
    }

    // ================= LOW STOCK =================
    let recentStock = data.recent_stock || [];

    let lowStock = recentStock[0]; // already filtered in PHP (stock <= 5)

    if (lowStock) {
        recentActivityHTML += `
            <div class="recentStock">
                <i class="fa-solid fa-box-open"></i>
                <div class="stockDetails">
                    <p>Low Stock Alert</p>
                    <span>${lowStock.name} (${lowStock.stock} left)</span>
                </div>
            </div>
        `;
    }

    // ================= PAYMENT SUMMARY =================
    recentActivityHTML += `
        <div class="recentPayment">
            <i class="fa-solid fa-money-bills"></i>
            <div class="paymentDetails">
                <p>Payment Summary</p>
                <span>Total Revenue: $${data.total_revenue || 0}</span>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = `
        <h2>Dashboard Overview</h2>
        <p>Real-time performance tracking for LuxeCommerce enterprise.</p>

        <div class="dashboardCards">
            <div class="dashboardCard_1">
                <p>Total Users</p>
                <p>${data.total_users}</p>
            </div>

            <div class="dashboardCard_2">
                <p>Total Products</p>
                <p>${data.total_products}</p>
            </div>

            <div class="dashboardCard_3">
                <p>Total Orders</p>
                <p>${data.total_orders}</p>
            </div>

            <div class="dashboardCard_4">
                <p>Total Revenue</p>
                <p>$${data.total_revenue.toLocaleString()}</p>
            </div>
        </div>

        <div class="dashboardChartsandrecentActivity">
            <div class="dashboardCharts">
                <div class="dashboardChartHeader">
                    <div class="chartTitle">
                        <p>Sales Trends</p>
                        <P>Visualizing performance across key regions.</P>
                    </div>

                    <div class="chartGuidence">
                        <div class="current"></div>
                        <p>Current</p>
                        <div class="previous"></div>
                        <p>Previous</p>
                    </div>
                </div>

                <div class="dashboardChartContent"></div>
            </div>

            <div class="dashboardRecentActivity">
                <p>Recent Activity</p>

                <div class="recentActivityContent">
                    ${recentActivityHTML}

                    <div class="viewAllActivity">
                        <a href="#">View All Activity</a>
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                </div>

            </div>
        </div>

        

        <div class="dashboardLatestOrders">

            <div class="dashboardLatestOrderHeader">
                <p>Latest Orders</p>
                <a href="#">View All Orders</a>
            </div>

            <table class="ordersTable">

                <thead>
                    <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>PRODUCT</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                    </tr>
                </thead>

                <tbody>
                    ${dashboardRow}
                </tbody>

            </table>

        </div> 
    `;

}

function createDashboardChart(products) {

    const chartContainer = document.querySelector(".dashboardChartContent");

    if (!chartContainer) {
        console.log("Chart container not found");
        return;
    }

    if (!products || products.length === 0) {
        console.log("No products for chart");
        return;
    }

    let categoryMap = {};

    products.forEach(p => {

        let cat = p.category || "Unknown";

        if (!categoryMap[cat]) {
            categoryMap[cat] = 0;
        }

        categoryMap[cat]++;
    });

    let labels = Object.keys(categoryMap);
    let values = Object.values(categoryMap);

    console.log("CHART LABELS:", labels);
    console.log("CHART VALUES:", values);

    chartContainer.innerHTML = `<canvas id="dashboardChart"></canvas>`;

    setTimeout(() => {

        const canvas = document.getElementById("dashboardChart");

        if (!canvas) {
            console.log("Canvas not found");
            return;
        }

        new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Products by Category",
                    data: values,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    }, 100); // IMPORTANT FIX
}

function loadDashboardChart() {

    fetch("https://luxemart.rf.gd/Backend/api/products.php")
    .then(res => res.json())
    .then(products => {

        console.log("CHART PRODUCTS:", products);

        createDashboardChart(products);

    })
    .catch(error => {
        console.log("CHART FETCH ERROR:", error);
    });
}

// For Orders
fetch("https://luxemart.rf.gd/Backend/api/get_orders.php")
.then(res => res.json())
.then(orders => {

    allOrders = orders

    console.log("ALL ORDERS:", allOrders);
    displayOrdersData(allOrders);

})
.catch(error => {
    console.log("FETCH ERROR:", error);
});

function displayOrdersData(orders){
    if(!orderContainer) return;

    let orderRow = "";
    let totalNumOfOrders = orders.filter(order =>
        order.order_id
    ).length;

    let totalNumOfRevenue = orders.reduce((total,order)=>{
        return total + Number(order.total_price)
    },0);

    orders.forEach(order =>{
    
        
        let order_img = order.profile_img ? order.profile_img : 
            "../assets/img/luxeProductCollection/profile img.jpg";

        orderRow += `
            <tr>
                <td>#ORD-${order.order_id}</td>

                <td class="customer">
                    <img src="${order_img}" alt="">
                    <div class="customerdetail">
                        <p>${order.fullname}</p>
                        <p>${order.email}</p>
                    </div>
                </td>

                <td>${order.created_at}</td>

                <td>$${order.price}</td>

                <td>
                    <span class="status paid">paid</span>
                </td>

                <td>
                    <span class="status shipped">Shipped</span>
                </td>

                <td>
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </td>
            </tr>
        `
    });

    orderContainer.innerHTML = `
        <h2>Orders</h2>

        <div class="orderCards">
            <div class="orderCard_1">
                <p>Total Orders</p>
                <div class="orderCardOneDetails">
                    <p>${totalNumOfOrders}</p>
                    <div class="orderOneTrends">
                        <p>+12%</p>
                    </div>
                </div>
            </div>
            <div class="orderCard_2">
                <p>Total Revenue</p>
                <div class="orderCardTwoDetails">
                    <p>$${totalNumOfRevenue}</p>
                    <div class="orderTwoTrends">
                        <p>+9%</p>
                    </div>
                </div>
            </div>
            <div class="orderCard_3">
                <p>Pending Processing</p>
                <div class="orderCardThreeDetails">
                    <p>42</p>
                    <div class="orderThreeTrends">
                        <p>-12%</p>
                    </div>
                </div>
            </div>
            <div class="orderCard_4">
                <p>Refund Rate</p>
                <div class="orderCardOneDetails">
                    <p>0.8%</p>
                    <div class="orderOneTrends">
                        <p>Stable</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="listOfOrdersContainer">
            <div class="listOfOrdersHeader">
                <div class="filtersOfOrders">
                    <div class="dateFilters">
                        <i class="fa-regular fa-calendar"></i>
                        <p>begin date</p>
                        <p>-</p>
                        <p>end date</p>
                    </div>
                    <div class="orderFilters">
                        <i class="fa-solid fa-filter"></i>
                        <p>Filters</p>
                    </div>
                </div>

                <div class="exportDataOrders">
                    <i class="fa-solid fa-file-export"></i>
                    <p>Export Data</p>
                </div>
            </div>

            <div class="listOfOrdersContent">
                <table class="listOfOrdersTable">

                    <thead>
                        <tr>
                            <th>ORDER ID</th>
                            <th>CUSTOMER</th>
                            <th>DATE</th>
                            <th>AMOUNT</th>
                            <th>PAYMENT STATUS</th>
                            <th>FULFILLMENT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                        ${orderRow}
                    </tbody>

                </table>
            </div>
        </div>
    `
}


// For Inventory btn
fetch("https://luxemart.rf.gd/Backend/api/products.php")
.then(res => res.json())
.then(products => {

    allProducts = products;
    filteredProducts = products;


    console.log("ALL PRODUCTS LOADED:", allProducts);
    displayInventoryData(filteredProducts);
    updateInventoryCards(allProducts);
    setupInventorySearch(); 
    
});

function displayInventoryData(products){
    const tbodyData = document.getElementById("tbodyInventoryData");
    if(!tbodyData) return;

    let inventoryRow = "";
    
    products.forEach(product =>{

        const status = product.stock > 0 ? "In Stock" : "Out of Stock";
        const colorClass = product.stock > 0 ? "inStock" : "outOfStock";

        inventoryRow += `
            <tr>
                <td>
                    <img src="../assets/img/luxeProductList/${product.image}" alt="">
                    <p>${product.name}</p>
                </td>
                <td>
                    <p>SKU${product.id}</p>
                </td>
                <td>
                    <p>${product.category}</p>
                </td>
                <td>
                    <div class="stockLevel">
                        <p>${product.stock}</p>
                        <div class="stockLevelTrends"></div>
                    </div>
                </td>
                <td>
                    <p>$${product.price}</p>
                </td>
                <td>
                    <span class="status ${colorClass}">
                        ${status}
                    </span>
                </td>
                <td>
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </td>
            </tr>
        `
    });


    tbodyData.innerHTML = inventoryRow;
}

function updateInventoryCards(products){
    let totalNumOfProducts = products.filter(product =>
        product.name
    ).length;

    let totalNumOfLowStock = products.filter(product =>
        product.stock < 5
    ).length;

    let totalNumOfOutStock = products.filter(product =>
        product.stock <= 0
    ).length;

    let totalValueOfProduct = products.reduce((total, product) => {
        return total + (product.stock * product.price);
    }, 0);

    document.getElementById("totalSkus").textContent = totalNumOfProducts;
    document.getElementById("lowStock").textContent = totalNumOfLowStock;
    document.getElementById("outStock").textContent = totalNumOfOutStock;
    document.getElementById("inventoryValue").textContent = `$${totalValueOfProduct.toLocaleString()}`;
}

function setupInventorySearch() {

    const searchInput = document.getElementById("inventorySearchInput");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase();

        filteredProducts = allProducts.filter(product => {

            return (
                product.name.toLowerCase().includes(value) ||
                product.category.toLowerCase().includes(value) ||
                String(product.id).includes(value)
            );
        });

        displayInventoryData(filteredProducts);
    });
}




// For Customer btn 
fetch("https://luxemart.rf.gd/Backend/api/get_customers.php")
.then(res => res.json())
.then(customers => {

    allCustomers = customers;

    console.log("ALL CUSTOMERS LOADED:", allCustomers);

    displayCustomerData(allCustomers);

});

function displayCustomerData(customers){

    if(!customerContainer) return;

    let numberOfUser = customers.length;

    let customerRows = "";

    let activeCustomers = customers.filter(customer =>
        customer.status === "active"
    ).length;

    customers.forEach(customer => {

        let profileImg = customer.profile_img
            ? customer.profile_img
            : "../assets/img/luxeProductCollection/profile img.jpg";

        customerRows += `
            <tr>
                <td>
                    <div class="customerImg">
                        <img src="${profileImg}" alt="profile img">
                    </div>

                    <div class="customerDetail">
                        <p>${customer.fullname}</p>
                        <p>${customer.email}</p>
                    </div>
                </td>

                <td>
                    <span class="active">${customer.status}</span>
                </td>

                <td>
                    <p>${customer.created_at}</p>
                </td>

                <td>
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </td>
            </tr>
        `;
    });

    customerContainer.innerHTML = `
        <div class="customerHeader">
            <h2>User Management</h2>
            <p>Manage and monitor your enterprise customer base and adminstative roles.</p>
        </div>

        <div class="customerCards">

            <div class="customerCard_1">
                <div class="customerCardOne_1">
                    <i class="fa-solid fa-user-group"></i>

                    <div class="customerTrend">
                        <p>+12%</p>
                    </div>
                </div>

                <div class="customerCardOne_2">
                    <p>TOTAL USERS</p>
                    <p>${numberOfUser}</p>
                </div>
            </div>

            <div class="customerCard_2">
                <div class="customerCardTwo_1">
                    <i class="fa-solid fa-user-check"></i>

                    <div class="activeCustomerTrend">
                        <p>+12%</p>
                    </div>
                </div>

                <div class="customerCardTwo_2">
                    <p>ACTIVE CUSTOMERS</p>
                    <p>${activeCustomers}</p>
                </div>
            </div>

        </div>

        <div class="customerTableContainer">

            <div class="customerTableHeader">

                <div class="customerTableTitle">
                    <p>All Users</p>
                </div>

                <div class="customerFilter">
                    <i class="fa-solid fa-filter"></i>
                </div>

            </div>

            <table class="customerTable">

                <thead>
                    <tr>
                        <th>USER</th>
                        <th>STATUS</th>
                        <th>JOIN DATE</th>
                        <th>ACTION</th>
                    </tr>
                </thead>

                <tbody>
                    ${customerRows}
                </tbody>

            </table>

        </div>
    `;
}

function totalNumberOfUser(customers){
    return customers.length;
}



// For Reveneue
fetch("https://luxemart.rf.gd/Backend/api/admin_revneue.php")
.then(res => res.json())
.then(data => {

    console.log("REVENUE API:", data);

    allRevenuesData = data;

    displayRevenueData(allRevenuesData);
    createRevenueChart(data.transactions);

})
.catch(error => {
    console.log("REVENUE FETCH ERROR:", error);
});



function displayRevenueData(data){

    if(!revenueContainer) return;

    let revenuesRow = "";

    // LOOP TRANSACTIONS
    data.transactions.forEach(tx => {

        revenuesRow += `
            <tr>
                <td>${tx.transaction_id}</td>
                <td>${tx.customer}</td>
                <td>${tx.method}</td>
                <td>
                    <p class="statusRevenue">${tx.status}</p>
                </td>
                <td>$${Number(tx.tax).toFixed(2)}</td>
                <td>$${Number(tx.gross_amount).toFixed(2)}</td>
            </tr>
        `;
    });

    // TOTAL GROSS REVENUE
    let gross = Number(data.gross_revenue || 0).toLocaleString();

    revenueContainer.innerHTML = `
        <div class="revenueHeader">
            <h2>Revenue & Financials</h2>
            <p>Real-time performance tracking and fiscal insights</p>
        </div>

        <div class="revenueChartsContainer">
            <div class="revenueChartHeader">
                <p>GROSS REVENUE</p>
                <p>$${gross}</p>
            </div>

            <div class="revenueChart"></div>
        </div>

        <div class="revenueTableContainer">
            <div class="revenueTableHeader">
                <div class="revenueTableHeader_1">
                    <p>Recent Revenue Events</p>
                </div>
            </div>

            <table class="revenueTable">
                <thead>
                    <tr>
                        <th>TRANSACTION ID</th>
                        <th>CUSTOMER</th>
                        <th>METHOD</th>
                        <th>STATUS</th>
                        <th>TAX</th>
                        <th>GROSS AMOUNT</th>
                    </tr>
                </thead>

                <tbody>
                    ${revenuesRow}
                </tbody>
            </table>
        </div>
    `;
}

function createRevenueChart(transactions) {

    const chartContainer = document.querySelector(".revenueChart");

    if (!chartContainer) return;

    if (!transactions || transactions.length === 0) return;

    let labels = [];
    let values = [];

    transactions.forEach(tx => {

        labels.push("TX-" + tx.transaction_id);
        values.push(Number(tx.gross_amount));
    });

    chartContainer.innerHTML = `<canvas id="revenueChartCanvas"></canvas>`;

    const canvas = document.getElementById("revenueChartCanvas");

    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Revenue",
                data: values,
                borderColor: "blue",
                backgroundColor: "rgba(0,0,255,0.2)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {

    const adminName = localStorage.getItem("admin_name");
    const adminImg = localStorage.getItem("admin_profile_img");

    // =========================
    // SET NAME
    // =========================
    if (adminName) {
        document.getElementById("adminName").innerText = adminName;
    } else {
        document.getElementById("adminName").innerText = "Unknown Admin";
    }

    // =========================
    // SET PROFILE IMAGE
    // =========================
    if (adminImg) {
        document.getElementById("adminProfileImg").src = adminImg;
    } else {
        document.getElementById("adminProfileImg").src =
            "../assets/img/luxeProductCollection/profile img.jpg";
    }
});


const menuIcon = document.querySelector(".menuIcon");
const sidebar = document.querySelector(".leftSideAdminPanel");
const overlay = document.getElementById("overlay");

// clicking menu icon 
menuIcon.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    overlay.classList.toggle("show");
});

// overlay when the menu clicked
overlay.addEventListener("click", () => {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
});

// Logout in admin panel page
document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("adminLogoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            // remove admin session data
            localStorage.removeItem("adminId");
            localStorage.removeItem("adminName");
            localStorage.removeItem("token"); // if you use token

            // redirect to login page
            window.location.href = "/luxemart-fullstack/Frontend/html/luxeSignupLoginToAdminPanel.html";
        });
    }

});