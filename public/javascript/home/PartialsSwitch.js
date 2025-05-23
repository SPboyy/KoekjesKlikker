function showCenter(templateId) {
  const source   = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html     = template({});
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