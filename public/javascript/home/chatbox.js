function chatbox() {
  // Verwijder eventuele eerder gekozen chatkleur van deze sessie
  sessionStorage.removeItem('chatColor');
  // Navigeer naar de chatbox-pagina
  window.location.href = "/chatbox";
}
