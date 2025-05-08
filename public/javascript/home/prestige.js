function confirmPrestige() {
    closePopup();

    window.location.href = "/prestige";
  }
    window.addEventListener("click", function(event) {
        const popup = document.getElementById("popup");
        if (event.target === popup) {
            closePopup();
        }
    });