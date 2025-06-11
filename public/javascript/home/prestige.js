function openPopup() {
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function confirmReincarnation() {
  console.log("confirmReincarnation() is aangeroepen");
  fetch("http://localhost:3000/reincarnate", {
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
  if (data.success && data.redirectUrl) {
    window.location.href = data.redirectUrl;
  }
})
.catch(err => {
  alert("Fout bij reïncarnatie: " + err.message);
});
}

document.getElementById('confirm-reincarnate-yes').onclick = function () {
  confirmReincarnation();
};

document.getElementById('popup').addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup')) {
    closePopup();
  }
});