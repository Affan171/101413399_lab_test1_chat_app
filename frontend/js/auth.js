const API_URL = "http://localhost:5000";

// Signup Function
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userData = {
        username: document.getElementById("username").value,
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        password: document.getElementById("password").value
    };

    const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    alert(result.message);
    if (response.ok) window.location.href = "index.html";
});

// Login Function
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userData = {
        username: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value
    };

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem("token", result.token);
        window.location.href = "chat.html";
    } else {
        alert(result.message);
    }
});

// Logout Function
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
