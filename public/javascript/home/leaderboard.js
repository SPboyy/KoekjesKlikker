document.addEventListener('DOMContentLoaded', () => {
  showLeaderboard(); // eerste keer laden
  setInterval(updateLeaderboard, 5000); // ververs elke 5 seconden
});

function showLeaderboard() {
  fetch('/api/leaderboard')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('centerContent');
      if (!container) return;

      let html = `
        <div class="podium">
          <div class="podium-block second">
            <div class="podium-rank">2</div>
            <div class="podium-name">${data.topPlayers[1]?.username || 'Niemand'}</div>
          </div>
          <div class="podium-block first">
            <div class="podium-rank">1</div>
            <div class="podium-name">${data.topPlayers[0]?.username || 'Niemand'}</div>
          </div>
          <div class="podium-block third">
            <div class="podium-rank">3</div>
            <div class="podium-name">${data.topPlayers[2]?.username || 'Niemand'}</div>
          </div>
        </div>
        <div class="containerLeaderboard">
          <table>
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Name</th>
                <th>Total Cookies</th>
              </tr>
            </thead>
            <tbody id="leaderboardBody">
              ${renderRows(data.fullLeaderboard)}
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = html;
    });
}

function updateLeaderboard() {
  fetch('/api/leaderboard')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('leaderboardBody');
      if (tbody) {
        tbody.innerHTML = renderRows(data.fullLeaderboard);
      }

      // eventueel ook top 3 updaten
      const podium = document.querySelector('.podium');
      if (podium) {
        podium.querySelector('.first .podium-name').textContent = data.topPlayers[0]?.username || 'Niemand';
        podium.querySelector('.second .podium-name').textContent = data.topPlayers[1]?.username || 'Niemand';
        podium.querySelector('.third .podium-name').textContent = data.topPlayers[2]?.username || 'Niemand';
      }
    });
}

function renderRows(leaderboard) {
  return leaderboard.map((player, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${player.username}</td>
      <td>${player.totalAmountOfCookies.toLocaleString()}</td>
    </tr>
  `).join('');
}
