// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim();

    if (message !== "") {
        // Emit a "chat message" event to the server with the user's message
        socket.emit("chat message", `${userName}: ${message}`);

        // Clear the input field
        messageInput.value = "";
        messageInput.focus();
    }
}





// Listen for incoming messages from the server
socket.on("chat message", function (message) {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.textContent = message;

    chatMessages.appendChild(messageDiv);

    // Scroll to the bottom to show the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    sendButton.addEventListener("click", () => {
        sendMessage();
    });

    messageInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = messageInput.value;
        if (message.trim() !== "") {
            socket.emit("chat message", message);
            messageInput.value = "";
        }
    }

    socket.on("chat message", (message) => {
        const messagesList = document.getElementById("messages");
        const listItem = document.createElement("li");
        listItem.textContent = message;
        messagesList.appendChild(listItem);
    });
});

