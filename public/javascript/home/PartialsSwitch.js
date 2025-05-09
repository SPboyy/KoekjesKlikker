function renderTemplate(templateId) {
    const source = document.getElementById(templateId).innerHTML;
    const template = Handlebars.compile(source);
    const html = template({});
    document.getElementById("centerContent").innerHTML = html;
  }
  
  function showStats() {
    renderTemplate("template-centerStats");
  }
  
  function showLeaderboard() {
    renderTemplate("template-centerLeaderboard");
  }
  