function showCenter(templateId) {
  const source = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html = template({});
  
  document.getElementById("centerContent").innerHTML = html;
}
  function showStats() {
    showCenter("template-centerStats");
  }
  
  function showLeaderboard() {
  showCenter("template-centerLeaderboard");

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
            <tbody>
              ${data.fullLeaderboard.map((player, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${player.username}</td>
                  <td>${player.amountOfCookies.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML = html;
    })
    .catch(err => console.error('Fout bij laden leaderboard:', err));
}

  function showOptions(){
    showCenter("template-centerOptions");
  }