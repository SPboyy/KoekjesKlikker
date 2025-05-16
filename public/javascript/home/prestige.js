function openPopup() {
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function confirmReincarnation() {
  console.log("confirmReincarnation() is aangeroepen");
  fetch("http://localhost:3000/prestige/reincarnate", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Unauthorized");
    }
    return res.json();
  })
  .then(data => {
  console.log("Response van server:", data);
  alert("Redirect naar: " + data.redirectUrl); // Test of deze popup komt
  if (data.success && data.redirectUrl) {
    window.location.href = data.redirectUrl;
  }
})
  .catch(err => {
    alert("Fout bij reïncarnatie: " + err.message);
  });
}

document.getElementById('confirm-yes').onclick = function () {
  confirmReincarnation();
};

// Sluit popup als je buiten het popup-venster klikt
document.getElementById('popup').addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup')) {
    closePopup();
  }
});