
document.addEventListener('DOMContentLoaded', () => {
  const cookieCountEl = document.getElementById('cookieCount');
  const cpsDisplayEl = document.getElementById('cpsDisplay');
  const fingerBtn = document.getElementById('fingerButton');
  const cookiesPerClickDisplay = document.getElementById('cookiesPerClickDisplay');


  let cookiesPerClick = 0.5;
  let cookieCount = 0;
  let clickCount = 0;

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
    console.log("Finger clicked, cookiesPerClick is nu:", cookiesPerClick*2);
    cookiesPerClickDisplay.textContent = `Cookies per click ${cookiesPerClick*2}`;
  });
} else {
  console.warn("fingerButton niet gevonden in de DOM");
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#cookieClickBtn')) {
    console.log("Koekje geklikt, voeg", cookiesPerClick, "cookies toe");
    clickCount++;
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