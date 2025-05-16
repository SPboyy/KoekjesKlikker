document.addEventListener('DOMContentLoaded', function () {
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
});
