document.addEventListener('DOMContentLoaded', () => {
  const cookieCountEl = document.getElementById('cookieCount');
  const cpsDisplayEl = document.getElementById('cpsDisplay');
  const fingerBtn = document.getElementById('fingerButton');
  const cookiesPerClickDisplay = document.getElementById('cookiesPerClickDisplay');

  let cookiesPerClick = 1;
  let cookieCount = 0;

  function updateStats() {
    fetch('/get-stats')
      .then(res => res.json())
      .then(data => {
        cookieCount = data.total;
        cookieCountEl.textContent = data.total;
        cpsDisplayEl.textContent = data.cps;
      })
      .catch(err => console.error('Error fetching stats:', err));
  }

  setInterval(updateStats, 2000);

  if (fingerBtn) {
  fingerBtn.addEventListener('click', () => {
    cookiesPerClick *= 2;
    console.log("Finger clicked, cookiesPerClick is nu:", cookiesPerClick);
    cookiesPerClickDisplay.textContent = `Cookies per click ${cookiesPerClick}`;
  });
} else {
  console.warn("fingerButton niet gevonden in de DOM");
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#cookieClickBtn')) {
    console.log("Koekje geklikt, voeg", cookiesPerClick, "cookies toe");
    fetch('/add-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: cookiesPerClick })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Response van server:", data);
      cookieCount = data.total;
      cookieCountEl.textContent = cookieCount;
    })
    .catch(err => console.error('Error adding cookie:', err));
  }
});

  updateStats();
});