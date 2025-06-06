fetch('/api/leaderboard')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('centerContent');
    if (!container) return;

    // HTML voor de top 3 (podium)
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

    // Optioneel: automatisch vernieuwen elke 10 seconden
    setInterval(() => {
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(newData => {
          const tbody = document.getElementById('leaderboardBody');
          if (tbody) {
            tbody.innerHTML = renderRows(newData.fullLeaderboard);
          }
        });
    }, 10000);
  })
  .catch(err => console.error('Fout bij laden leaderboard:', err));

// Functie om leaderboard-rijen te genereren
function renderRows(leaderboard) {
  return leaderboard.map((player, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${player.username}</td>
      <td>${player.totalAmountOfCookies.toLocaleString()}</td>
    </tr>
  `).join('');
}
