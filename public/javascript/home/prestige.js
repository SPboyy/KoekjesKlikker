function openPopup() {
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function confirmPrestige() {
  if (confirm("Weet je zeker dat je wilt prestigeren?")) {
    fetch("/prestige/reincarnate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      if (response.ok) {
        // ✅ Succesvol: stuur gebruiker naar prestige-pagina
        window.location.href = "/prestige";
      } else {
        alert("Prestige mislukt.");
      }
    })
    .catch(error => {
      console.error("Fout bij prestige:", error);
      alert("Er is een fout opgetreden.");
    });
  }
}

// Sluit popup als je buiten het popup-venster klikt
document.getElementById('popup').addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup')) {
    closePopup();
  }
});