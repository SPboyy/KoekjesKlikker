function showCenter(templateId) {
  const source   = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html     = template({});
  document.getElementById("centerContent").innerHTML = html;
}
  function showStats() {
    showCenter("template-centerStats");
  }
  
  function showLeaderboard() {
    showCenter("template-centerLeaderboard");
  }

  function showOptions(){
    showCenter("template-centerOptions")
  }