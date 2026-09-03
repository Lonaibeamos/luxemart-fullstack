const adminSignupContainer = document.getElementById("adminSignupContainer");
const adminLoginContainer = document.getElementById("adminLoginContainer");

const adminLoginOptionBtn = document.getElementById("adminLoginOptionBtn");
const adminSignupOptionBtn = document.getElementById("adminSignupOptionBtn");


const signupForm = document.querySelector(".adminSignupForm");
const loginForm = document.querySelector(".adminLoginForm");


// default state (login visible)
adminLoginContainer.classList.add("show");
adminSignupContainer.classList.remove("show");

// LOGIN BUTTON CLICK
adminLoginOptionBtn.addEventListener("click", () => {
    adminLoginContainer.classList.add("show");
    adminSignupContainer.classList.remove("show");

    adminLoginOptionBtn.style.background = "#1c7960";
    adminLoginOptionBtn.style.color = "white";

    adminSignupOptionBtn.style.background = "white";
    adminSignupOptionBtn.style.color = "#374151";
});

// SIGNUP BUTTON CLICK
adminSignupOptionBtn.addEventListener("click", () => {
    adminSignupContainer.classList.add("show");
    adminLoginContainer.classList.remove("show");

    adminSignupOptionBtn.style.background = "#1c7960";
    adminSignupOptionBtn.style.color = "white";

    adminLoginOptionBtn.style.background = "white";
    adminLoginOptionBtn.style.color = "#374151";
});


signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("adminUserName").value.trim();
    const email = document.getElementById("adminUserEmail").value.trim();
    const password = document.getElementById("adminUserPassword").value.trim();
    const role = document.getElementById("adminUserRole").value;

    const profile_img = "../assets/img/luxeProductCollection/profile-img.jpg";

    if (!fullname || !email || !password || !role) {
        showToast("Please fill all fields", "error");
        return;
    }

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("profile_img", profile_img);

    try {
        const res = await fetch("https://luxemart.rf.gd/Backend/api/admin_signup.php", {
            method: "POST",
            body: formData
        });

        const text = await res.text();
        let data = JSON.parse(text);

        if (data.status === "success") {
            showToast("Admin created successfully!", "success");
            signupForm.reset();
            showLogin(); // now FIXED
        } else {
            showToast(data.message, "error");
        }

    } catch (error) {
        console.log(error);
        showToast("Server error during signup", "error");
    }
});


// ===========================
// LOGIN FUNCTION
// ===========================
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminLoginUserEmail").value.trim();
    const password = document.getElementById("adminLoginUserPassword").value.trim();

    if (!email || !password) {
        showToast("Please enter email and password", "error");
        return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
        const res = await fetch(
            "https://luxemart.rf.gd/Backend/api/admin_login.php",
            {
                method: "POST",
                body: formData
            }
        );

        const text = await res.text();
        console.log("RAW LOGIN RESPONSE:", text);

        const data = JSON.parse(text);

        if (data.status === "success") {
            showToast("Login successful", "success");

            localStorage.setItem("admin_id", data.admin.id);
            localStorage.setItem("admin_name", data.admin.fullname);
            localStorage.setItem("admin_role", data.admin.role);

            setTimeout(() => {
                window.location.href = "/luxemart-fullstack/Frontend/html/luxeAdminPanelPage.html";
            }, 800);

        } else {
            showToast(data.message || "Login failed", "error");
        }

    } catch (error) {
        console.log(error);
        showToast("Server error during login", "error");
    }
});


function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.innerText = message;

    container.appendChild(toast);

    // auto remove
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}