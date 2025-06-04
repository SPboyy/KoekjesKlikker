document.addEventListener('DOMContentLoaded', function() {
  const input       = document.getElementById('messageInput');
  const sendButton  = document.getElementById('sendButton');
  const clearButton = document.getElementById('clearButton');
  const chatBox     = document.getElementById('chatBox');

  // Sleutel‐namen voor storage
  const COLOR_KEY   = 'chatColor';      // sessiekleur voor nieuwe berichten
  const STORAGE_KEY = 'chatMessages';   // array van { text: "...", color: "hsl(...)" }

  /**
   * Haal (of creëer) de session‐kleur.
   * Wordt één keer per sessie gegenereerd en bewaard in sessionStorage.
   */
  function getSessionColor() {
    let color = sessionStorage.getItem(COLOR_KEY);
    if (!color) {
      // Genereer nieuwe pastel‐achtige HSL‐kleur
      const hue        = Math.floor(Math.random() * 360);
      const saturation = 70;  // 70%
      const lightness  = 75;  // 75%
      color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      sessionStorage.setItem(COLOR_KEY, color);
    }
    return color;
  }

  // Bepaal bij paginalaad wélke kleur nieuwe berichten krijgen
  const sessionColor = getSessionColor();

  /**
   * Lees berichten (met kleur) uit localStorage en toon ze in #chatBox.
   * Elk opgeslagen object is in de vorm { text: "...", color: "hsl(...)" }.
   */
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

    // Voor elk opgeslagen bericht-object:
    messagesArray.forEach(item => {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'right');
      messageDiv.textContent = item.text;
      // **gebruik de kleur die in localStorage was bewaard**
      messageDiv.style.backgroundColor = item.color;
      chatBox.appendChild(messageDiv);
    });

    // Scroll naar beneden, zodat je de nieuwste berichten ziet.
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  /**
   * Voeg één nieuw bericht toe in de UI en sla {text,color} op in localStorage.
   * Nieuwe berichten krijgen de (zelfde) sessionColor.
   */
  function addMessage() {
    const text = input.value.trim();
    if (text === '') return;

    // Maak nieuw bericht-div aan met de session‐kleur:
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'right');
    messageDiv.textContent = text;
    messageDiv.style.backgroundColor = sessionColor;
    chatBox.appendChild(messageDiv);

    // Scroll naar beneden
    chatBox.scrollTop = chatBox.scrollHeight;

    // Haal bestaande array uit localStorage (of maak nieuwe)
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

    // Voeg nieuw object toe: { text, color: sessionColor }
    messagesArray.push({ text: text, color: sessionColor });

    // Sla de geüpdatete array weer op
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesArray));
    } catch (e) {
      console.error('Fout bij opslaan van chat in localStorage:', e);
    }

    input.value = '';
    input.focus();
  }

  /**
   * Wis alle berichten: verwijder uit de UI **en** uit localStorage.
   * De <h2>Global chat</h2> (eerste child) blijft staan; we verwijderen alles erna.
   */
  function clearChat() {
    while (chatBox.children.length > 1) {
      chatBox.removeChild(chatBox.lastChild);
    }
    localStorage.removeItem(STORAGE_KEY);
    input.focus();
  }

  // --- Event listeners instellen ---

  // 1) Bij paginalaad: laad alle bestaande berichten (met hun bewaarde kleur)
  loadMessagesFromStorage();

  // 2) Klik op de “>”-knop
  sendButton.addEventListener('click', addMessage);

  // 3) Enter-toets in het invoerveld
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      addMessage();
    }
  });

  // 4) Klik op “✖ Clear chat”-knop
  clearButton.addEventListener('click', clearChat);
});
