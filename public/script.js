document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
  
    const socket = io();
    const joinForm = document.getElementById('join-form');
    const chatContainer = document.getElementById('chat-container');
    const usernameInput = document.getElementById('username-input');
    const roomSelect = document.getElementById('room-select');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const userCount = document.getElementById('user-count');
    const toggleDarkModeButton = document.getElementById('toggle-dark-mode');

    // Toggle dark mode
  toggleDarkModeButton.addEventListener('click', () => {
    const isDarkMode = chatContainer.classList.toggle('dark-mode');
    chatBox.classList.toggle('dark-mode');
    const messages = document.querySelectorAll('.message');
    messages.forEach((message) => {
      message.classList.toggle('dark-mode');
    });
    chatInput.classList.toggle('dark-mode');
    toggleDarkModeButton.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
  });
  
    // Event listener for joining a chat room
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = usernameInput.value;
      const room = roomSelect.value;
      console.log('Join form submitted:', username, room); // Logging form submission details
      if (username.trim() && room.trim()) {
        socket.emit('joinRoom', { username, room });
        if (chatContainer) {
          chatContainer.style.display = 'block';
        } else {
          console.error('chatContainer not found');
        }
        joinForm.style.display = 'none';
      }
    });
  
    // Socket.io event listeners for chat functionality
    socket.on('chatHistory', (messages) => {
      messages.forEach((message) => {
        displayMessage(message);
      });
    });
  
    socket.on('message', (message) => {
      displayMessage(message);
    });
  
    socket.on('userCount', (data) => {
      userCount.textContent = `Users connected: ${data.count}`;
    });
  
    // Event listener for sending a chat message
    sendButton.addEventListener('click', () => {
      const msg = chatInput.value;
      if (msg.trim()) {
        socket.emit('chatMessage', msg);
        chatInput.value = '';
      }
    });
  
    // Function to display messages in the chat box
    function displayMessage({ username, message }) {
      const div = document.createElement('div');
      div.classList.add('message');
      div.innerHTML = `<p><strong>${username}:</strong> ${message}</p>`;
      chatBox.appendChild(div);
    }
  
  });
