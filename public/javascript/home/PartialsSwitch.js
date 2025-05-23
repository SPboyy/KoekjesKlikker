function showCenter(templateId) {
  const source   = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html     = template({});
  document.getElementById("centerContent").innerHTML = html;
}
  function showStats() {
  showCenter("template-centerStats");
  
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
