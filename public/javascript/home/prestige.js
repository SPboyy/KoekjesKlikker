    function openPopup() {
        document.getElementById("popup").style.display = "flex";
    }

    function closePopup() {
        document.getElementById("popup").style.display = "none";
    }

    function confirmPrestige() {
    window.location.href = "http://localhost:3000/prestige";
    }

    document.getElementById('popup').addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup')) {
    closePopup();
  }
  });