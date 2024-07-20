document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');
  const sendButton = document.getElementById('send-button');

  // Auto-resize input field
  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  const socket = io();
  const joinForm = document.getElementById('join-form');
  const chatContainer = document.getElementById('chat-container');
  const usernameInput = document.getElementById('username-input');
  const roomSelect = document.getElementById('room-select');
  const userCount = document.getElementById('user-count');
  const toggleDarkModeButton = document.getElementById('toggle-dark-mode');
  const roomNameElement = document.getElementById('room-name');

  // Set current year in the footer
  const currentYear = new Date().getFullYear();
  document.getElementById('year').textContent = currentYear;
  

  // Toggle dark mode
  toggleDarkModeButton.addEventListener('click', () => {
    const isDarkMode = chatContainer.classList.toggle('dark-mode');
    chatBox.classList.toggle('dark-mode');
    const messages = document.querySelectorAll('.message');
    messages.forEach((message) => {
      message.classList.toggle('dark-mode');
    });
    chatInput.classList.toggle('dark-mode');
    if (isDarkMode) {
      toggleDarkModeButton.classList.remove('fa-moon');
      toggleDarkModeButton.classList.add('fa-sun');
    } else {
      toggleDarkModeButton.classList.remove('fa-sun');
      toggleDarkModeButton.classList.add('fa-moon');
    }
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
        roomNameElement.textContent = `You have joined the ${room} room`; // Update room name
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
      chatInput.style.height = '30px'; // Reset the height after sending a message
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
