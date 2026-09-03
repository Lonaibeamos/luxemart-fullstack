document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    const email = document.getElementById("email");
    const password = document.getElementById("password");

    const eyeOpenIcon = document.getElementById("eyeOpenIcon");
    const eyeCloseIcon = document.getElementById("eyeCloseIcon");

    const toastContainer = document.getElementById("toast-container");

    // ICON DEFAULT STATE
    eyeOpenIcon.style.display = "none";
    eyeCloseIcon.style.display = "block";

    // SHOW PASSWORD
    eyeCloseIcon.addEventListener("click", () => {
        password.type = "text";
        eyeCloseIcon.style.display = "none";
        eyeOpenIcon.style.display = "block";
    });

    // HIDE PASSWORD
    eyeOpenIcon.addEventListener("click", () => {
        password.type = "password";
        eyeOpenIcon.style.display = "none";
        eyeCloseIcon.style.display = "block";
    });

    // LOGIN SUBMIT
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {

            const res = await fetch("http://localhost/smart-ecommerce-app/Backend/api/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            // IMPORTANT FIX (prevents server error)
            const text = await res.text();
            console.log("SERVER RESPONSE:", text);

            const data = JSON.parse(text);

            showToast(data.message, data.status);

            if (data.status === "success" && data.user) {

                localStorage.setItem("isLoggedIn", "true");

                if (data.user && data.user.id) {
                    localStorage.setItem("userId", String(data.user.id));
                } else {
                    console.log("USER ID MISSING FROM BACKEND");
                }

                localStorage.setItem("userName", data.user.fullname);
                localStorage.setItem("userEmail", data.user.email);

                const profileImg =
                    data.user.profile_img
                    ? data.user.profile_img
                    : "../assets/img/luxeProductCollection/profile img.jpg";

                localStorage.setItem("profileImg", profileImg);

                console.log("USER SAVED:", data.user.id);

                setTimeout(() => {
                    window.location.href =
                    "/luxemart-fullstack/Frontend/html/luxeHomePage.html";
                }, 1000);
            }

            console.log("LOGIN RESPONSE:", data);

        } catch (error) {
            console.log("ERROR:", error);
            showToast("Server error occurred", "error");
        }
    });

});


// TOAST SYSTEM
function showToast(message, type) {

    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast", type);

    toast.innerHTML = `
        <span>${type === "success" ? "✔" : "✖"}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


window.onload = function () {

    const client = google.accounts.oauth2.initTokenClient({
        client_id: "417369652488-s7odncbrsq00il1cl9ke5t1b6v7ruvq3.apps.googleusercontent.com",
        scope: "email profile openid",
        callback: async (response) => {

            try {

                // 1. Get Google user info
                const res = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${response.access_token}`
                        }
                    }
                );

                const user = await res.json();

                console.log("GOOGLE USER:", user);

                // 2. Send to backend (same auth system)
                const backendRes = await fetch(
                    "http://localhost/smart-ecommerce-app/Backend/api/login.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: user.email,
                            password: null
                        })
                    }
                );

                const data = await backendRes.json();
                let profileImg = data.user.profile_img || "../assets/img/luxeProductCollection/profile img.jpg";

                // 3. Show popup (your system)
                showToast(data.message, data.status);

                // 4. Success → save session + redirect
                if (data.status === "success") {

                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userEmail", user.email);
                    localStorage.setItem("userName", user.name);
                    localStorage.setItem("profileImg", profileImg);

                    showToast("Login successful", "success");

                    setTimeout(() => {
                        window.location.href =
                        "/luxemart-fullstack/Frontend/html/luxeHomePage.html";
                    }, 1000);

                } else {

                    // STILL show error but DO NOT redirect
                    showToast(data.message || "Login failed", "error");
                }

            } catch (error) {
                console.log(error);
                showToast("Google login failed", "error");
            }
        }
    });

    // 5. CLICK EVENT ON YOUR CUSTOM BUTTON
    const googleBtn = document.getElementById("googleBtn");

    if (googleBtn) {
        googleBtn.addEventListener("click", () => {
            client.requestAccessToken();
        });
    }
};
