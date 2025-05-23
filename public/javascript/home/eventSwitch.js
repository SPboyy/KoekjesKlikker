let eventTimeout = null;

function showEvent(templateId) {
  const source   = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html     = template({});
  document.getElementById("CookieContent").innerHTML = html;

  if (eventTimeout !== null) {
    clearTimeout(eventTimeout);
  }
  eventTimeout = setTimeout(showNormal, 5000);
}

   function showChristmass(){
     showEvent("template-Christmass");

  }
    function showEaster(){
    showEvent("template-Easter");
  }
    function showHalloween(){
    showEvent("template-Halloween");
  }
  function showNormal(){
    showEvent("template-NoEvent")
  }


