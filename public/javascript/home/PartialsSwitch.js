function showCenter(templateId) {
  const source = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html = template({});
  
  document.getElementById("centerContent").innerHTML = html;
}
function showStats() {
  showCenter("template-centerStats");

  // Wacht tot DOM is bijgewerkt met Handlebars output
  setTimeout(() => {
    loadAchievements();
  }, 100);
}

async function loadAchievements() {
  console.log("📊 Achievements laden...");

  try {
    const res = await fetch("/api/achievements");
    const achievements = await res.json();
    console.log("✅ Achievements ontvangen:", achievements);

    const list = document.getElementById("achievement-list");
    if (!list) {
      console.warn("❌ 'achievement-list' container niet gevonden");
      return;
    }

    list.innerHTML = "";

    achievements.forEach(ach => {
      const row = document.createElement("div");
      row.classList.add("achievement-row");

      row.innerHTML = `
        <div class="title">${ach.name}</div>
        <div class="description">${ach.description}</div>
        <div class="status">${ach.unlocked ? "Completed" : "Locked"}</div>
      `;

      list.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Fout bij ophalen achievements:", err);
  }
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

function showOptions() {
  showCenter("template-centerOptions");

  const audio = document.getElementById('myAudio');
  const volumeSlider = document.getElementById('volumeSlider');

  if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', function () {
      audio.volume = this.value;
    });
  } else {
    console.warn('Audio or volumeSlider not found in DOM.');
  }

  document.addEventListener('click', function () {
    audio.play().then(() => {
      console.log("Audio started.");
    }).catch(err => {
      console.log("Audio play failed:", err);
    });
  }, { once: true });
}