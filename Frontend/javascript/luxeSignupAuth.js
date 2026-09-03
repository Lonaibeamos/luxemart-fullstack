const submitBtn = document.getElementById("submitBtn");

document.getElementById("password").addEventListener("input", checkPassword);

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("signupForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fullname = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;
        const profileImg = '../assets/img/luxeProductCollection/profile img.jpg';

        try {
            const res = await fetch("https://luxemart.rf.gd/Backend/api/auth.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullname,
                    email,
                    phone,
                    password,
                    profileImg
                })
            });

            const data = await res.json();

            showPopup(data.message, data.status);

            if (data.status === "success") {

                // RESET FORM
                form.reset();

                // RESET PASSWORD TEXT
                const resultForChecking = document.getElementById("resultForChecking");
                if (resultForChecking) {
                    resultForChecking.textContent = "";
                }

                // RESET CHECKBOXES
                const boxes = [
                    document.getElementById("checkBox_1"),
                    document.getElementById("checkBox_2"),
                    document.getElementById("checkBox_3"),
                    document.getElementById("checkBox_4")
                ];

                boxes.forEach(box => {
                    if (box) {
                        box.style.visibility = "hidden";
                        box.style.background = "#ccc";
                    }
                });
            }

        } catch (error) {
            console.log(error);
            showPopup("Server error occurred", "error");
        }
    });

});


function checkPassword(){
    const password = document.getElementById("password").value;
    const resultForChecking = document.getElementById('resultForChecking');

    const box_1 = document.getElementById("checkBox_1");
    const box_2 = document.getElementById("checkBox_2");
    const box_3 = document.getElementById("checkBox_3");
    const box_4 = document.getElementById("checkBox_4");

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*_\-+=]/.test(password);
    const isLong = password.length >= 8;

    // RESET FIRST (VERY IMPORTANT)
    const boxes = [box_1, box_2, box_3, box_4];

    boxes.forEach(b => {
        b.style.visibility = "hidden";
        b.style.background = "#ccc";
    });

    // APPLY RULES
    if (isLong) {
        box_1.style.visibility = "visible";
        box_1.style.background = "green";
    }

    if (hasLetter) {
        box_2.style.visibility = "visible";
        box_2.style.background = "green";
    }

    if (hasNumber) {
        box_3.style.visibility = "visible";
        box_3.style.background = "green";
    }

    if (hasSymbol) {
        box_4.style.visibility = "visible";
        box_4.style.background = "green";
    }

    // RESULT TEXT
    if (password.length === 0) {
        resultForChecking.textContent = "";
        return;
    }

    if (isLong && hasLetter && hasNumber && hasSymbol) {
        resultForChecking.textContent = "Strong password detected ✔";
        resultForChecking.style.color = "green";
    } else {
        resultForChecking.textContent = "Weak password detected ✖";
        resultForChecking.style.color = "red";
    }
}
const passwordInput = document.getElementById("password");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClose = document.getElementById("eyeClose");

eyeOpen.addEventListener("click", () => {

    // show password
    passwordInput.type = "password";

    // switch icons
    eyeOpen.style.display = "none";
    eyeClose.style.display = "block";
});

eyeClose.addEventListener("click", () => {

    // hide password
    passwordInput.type = "text";

    // switch icons
    eyeClose.style.display = "none";
    eyeOpen.style.display = "block";
});

function showPopup(message, type) {

    const popup = document.createElement("div");

    popup.className = "popup";
    popup.innerText = message;

    popup.style.position = "fixed";
    popup.style.top = "20px";
    popup.style.right = "20px";
    popup.style.padding = "12px 20px";
    popup.style.color = "white";
    popup.style.borderRadius = "8px";
    popup.style.zIndex = "9999";

    popup.style.background = type === "success" ? "green" : "red";

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 3000);
}

window.onload = function () {

    const client = google.accounts.oauth2.initTokenClient({
        client_id: "417369652488-s7odncbrsq00il1cl9ke5t1b6v7ruvq3.apps.googleusercontent.com",
        scope: "email profile openid",
        callback: async (response) => {

            try {
                // GET GOOGLE USER INFO
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${response.access_token}`
                    }
                });

                const user = await res.json();

                console.log("GOOGLE USER:", user);

                // SEND TO YOUR BACKEND (IMPORTANT)
                const backendRes = await fetch("https://luxemart.rf.gd/Backend/api/auth.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullname: user.name,
                        email: user.email,
                        profileImg: user.picture
                    })
                });

                const data = await backendRes.json();

                showPopup(data.message, data.status);

                // ✅ THIS IS THE PART YOU WERE MISSING
                if (data.status === "success") {

                    localStorage.setItem("isLoggedIn", "true");

                    setTimeout(() => {
                        window.location.href = "/luxemart-fullstack/Frontend/html/luxeHomePage.html";
                    }, 1000);
                }

            } catch (err) {
                console.log(err);
                showPopup("Google login failed", "error");
            }
        }
    });

    document.getElementById("googleBtn").addEventListener("click", () => {
        client.requestAccessToken();
    });

};