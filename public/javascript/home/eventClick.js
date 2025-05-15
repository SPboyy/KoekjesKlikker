document.getElementById('CookieContent').addEventListener('click', async function(event) {
  const cookieBtn = event.target.closest('#cookieBtn');
  if (cookieBtn) {
    try {
      const response = await fetch('/add-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const cookieCountEl = document.getElementById('cookieCount');
      const cpsDisplayEl = document.getElementById('cpsDisplay');

      cookieCountEl.textContent = data.total;
      cpsDisplayEl.textContent = data.cps;

    } catch (error) {
      console.error("Cookie click error:", error);
    }
  }
});