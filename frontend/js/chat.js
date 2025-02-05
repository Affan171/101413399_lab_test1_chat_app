const socket = io("http://localhost:5000");
let currentRoom = "";
let currentUsername = localStorage.getItem("username");

// 📌 Wait for socket connection before using `socket.id`
socket.on("connect", () => {
    console.log(`✅ Connected to server with ID: ${socket.id}`);

    // Generate a default username if none is set
    if (!currentUsername) {
        currentUsername = `User_${socket.id.substring(0, 5)}`;
        localStorage.setItem("username", currentUsername);
    }

    // Send username to server after connection
    socket.emit("setUsername", currentUsername);
});

// 📌 Join a Room
function joinRoom() {
    const room = document.getElementById("room-select").value;
    currentRoom = room;
    socket.emit("joinRoom", room);
    document.getElementById("chat-box").innerHTML += `<p><b>Joined ${room}</b></p>`;

    // Fetch old messages from MongoDB via REST API
    fetch(`http://localhost:5000/chat/room/${room}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(response => response.json())
    .then(messages => {
        messages.forEach(msg => {
            document.getElementById("chat-box").innerHTML += `<p><b>${msg.from_user}:</b> ${msg.message}</p>`;
        });
    })
    .catch(error => console.error("❌ Error fetching messages:", error));
}

// 📌 Leave a Room
function leaveRoom() {
    if (!currentRoom) {
        alert("You are not in any room!");
        return;
    }

    socket.emit("leaveRoom", currentRoom);
    document.getElementById("chat-box").innerHTML += `<p><b>You left ${currentRoom}</b></p>`;
    console.log(`🚪 Left room: ${currentRoom}`);
    currentRoom = ""; // Reset room state
}

// 📌 Send a Public Message
function sendMessage() {
    const message = document.getElementById("message").value.trim();
    if (message === "") return;

    console.log(`📤 Sending message to ${currentRoom}: ${message}`);

    // Send message in real-time via Socket.io
    socket.emit("chatMessage", { room: currentRoom, from: currentUsername, message });

    // Save message in MongoDB
    fetch(`http://localhost:5000/chat/room/${currentRoom}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ from_user: currentUsername, message })
    });

    document.getElementById("message").value = "";
}

// 📌 Send a Private Message
function sendPrivateMessage() {
    const toUser = document.getElementById("user-select").value;
    const message = document.getElementById("message").value.trim();

    if (!toUser) {
        alert("Please select a user to chat with!");
        return;
    }

    if (message === "") return;

    console.log(`📩 Sending private message to ${toUser}: ${message}`);

    socket.emit("privateMessage", { to: toUser, from: currentUsername, message });

    // Display the message in the chat box
    document.getElementById("chat-box").innerHTML += `<p><b>You (Private to ${toUser}):</b> ${message}</p>`;
    document.getElementById("message").value = "";
}

// 📌 Typing Indicator
function typingIndicator() {
    if (currentRoom) {
        socket.emit("typing", currentRoom);
    }
}

// 📌 Listen for Incoming Public Messages
// 📌 Listen for Incoming Public Messages
socket.on("chatMessage", (data) => {
    console.log(`💬 Received message in ${data.room} from ${data.from}: ${data.message}`);

    if (data.room === currentRoom) {  // Only display if the user is in the same room
        document.getElementById("chat-box").innerHTML += `<p><b>${data.from}:</b> ${data.message}</p>`;
    }
});

// 📌 Listen for Private Messages
socket.on("privateMessage", (data) => {
    console.log(`📨 Received private message from ${data.from}: ${data.message}`);
    document.getElementById("chat-box").innerHTML += `<p><b>${data.from} (Private):</b> ${data.message}</p>`;
});

// 📌 Listen for Typing Indicator
socket.on("typing", () => {
    document.getElementById("typing").innerText = "Someone is typing...";
    setTimeout(() => (document.getElementById("typing").innerText = ""), 2000);
});

// 📌 Update Online User List for Private Messaging
socket.on("updateUserList", (users) => {
    console.log("🔄 Updating User List:", users); // Debugging log

    const userSelect = document.getElementById("user-select");
    userSelect.innerHTML = '<option value="">Select a User</option>'; // Reset list

    Object.entries(users).forEach(([socketId, username]) => {
        if (socketId !== socket.id) { // Exclude the current user
            userSelect.innerHTML += `<option value="${socketId}">${username} (${socketId})</option>`;
        }
    });

    console.log("✅ User list updated successfully.");
});

// 📌 Logout Function
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logout-btn")?.addEventListener("click", logout);
});

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
