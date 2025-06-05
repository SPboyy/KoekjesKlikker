document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const clearButton = document.getElementById('clearButton');
  const chatBox = document.getElementById('chatBox');

  const COLOR_KEY = 'chatColor';
  const STORAGE_KEY = 'chatMessages';

  // Genereer of haal sessiekleur op
  function getSessionColor() {
    let color = sessionStorage.getItem(COLOR_KEY);
    if (!color) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 70;
      const lightness = 75;
      color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      sessionStorage.setItem(COLOR_KEY, color);
    }
    return color;
  }

  const sessionColor = getSessionColor();

  // Laad berichten uit localStorage
  function loadMessagesFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    let messagesArray;
    try {
      messagesArray = JSON.parse(stored);
    } catch (e) {
      console.error('Fout bij parsen van opgeslagen chat:', e);
      return;
    }

    messagesArray.forEach((item) => {
      const messageDiv = document.createElement('div');
      const isCurrentSession = item.color === sessionColor;

      messageDiv.classList.add('message');
      messageDiv.classList.add(isCurrentSession ? 'right' : 'left');
      messageDiv.textContent = item.text;
      messageDiv.style.backgroundColor = item.color;

      chatBox.appendChild(messageDiv);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Voeg nieuw bericht toe
  function addMessage() {
    const text = input.value.trim();
    if (text === '') return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'right');
    messageDiv.textContent = text;
    messageDiv.style.backgroundColor = sessionColor;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    let messagesArray = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        messagesArray = JSON.parse(stored);
      } catch (e) {
        console.error('Fout bij parsen bestaande chat in localStorage:', e);
        messagesArray = [];
      }
    }

    messagesArray.push({ text: text, color: sessionColor });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesArray));
    } catch (e) {
      console.error('Fout bij opslaan van chat in localStorage:', e);
    }

    input.value = '';
    input.focus();
  }

  function clearChat() {
    chatBox.innerHTML = ''; 
    localStorage.removeItem(STORAGE_KEY);
    input.focus();
  }


  loadMessagesFromStorage();
  sendButton.addEventListener('click', addMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addMessage();
    }
  });
  clearButton.addEventListener('click', clearChat);
});
