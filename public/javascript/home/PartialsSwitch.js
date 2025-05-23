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

  function showOptions(){
    showCenter("template-centerOptions");
  }