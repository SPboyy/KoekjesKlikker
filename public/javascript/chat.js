document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const clearButton = document.getElementById('clearButton');
  const chatBox = document.getElementById('chatBox');

  const COLOR_KEY = 'chatColor';

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

  function loadMessages() {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        chatBox.innerHTML = "";
        data.forEach((msg) => {
          const messageDiv = document.createElement('div');
          const isCurrentSession = msg.color === sessionColor;
          messageDiv.classList.add('message');
          messageDiv.style.backgroundColor = msg.color;
          messageDiv.style.marginLeft = isCurrentSession ? 'auto' : '0';
          messageDiv.style.marginRight = isCurrentSession ? '0' : 'auto';
          messageDiv.style.maxWidth = '60%';
          messageDiv.style.padding = '10px';
          messageDiv.style.borderRadius = '8px';
          messageDiv.style.marginBottom = '5px';
          messageDiv.textContent = msg.text;
          chatBox.appendChild(messageDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
      });
  }

  function addMessage() {
    const text = input.value.trim();
    if (text === '') return;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, color: sessionColor })
    })
    .then(() => {
      input.value = '';
      loadMessages();
    });
  }

  function clearChat() {
    fetch('/api/chat', { method: 'DELETE' })
      .then(() => loadMessages());
  }

  sendButton.addEventListener('click', addMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addMessage();
  });
  clearButton.addEventListener('click', clearChat);

  loadMessages();
});
