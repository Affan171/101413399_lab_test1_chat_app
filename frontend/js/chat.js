const socket = io("http://localhost:5000");
let currentRoom = "";

// Join Room
function joinRoom() {
    const room = document.getElementById("room-select").value;
    currentRoom = room;
    socket.emit("joinRoom", room);
    document.getElementById("chat-box").innerHTML = `<p>Joined ${room}</p>`;
}

// Send Message
function sendMessage() {
    const message = document.getElementById("message").value;
    if (message.trim() === "") return;

    socket.emit("chatMessage", { room: currentRoom, message });
    document.getElementById("message").value = "";
}

// Typing Indicator
function typingIndicator() {
    socket.emit("typing", currentRoom);
}

// Listen for Messages
socket.on("chatMessage", (data) => {
    document.getElementById("chat-box").innerHTML += `<p>${data.message}</p>`;
});

// Listen for Typing
socket.on("typing", () => {
    document.getElementById("typing").innerText = "Someone is typing...";
    setTimeout(() => (document.getElementById("typing").innerText = ""), 2000);
});
