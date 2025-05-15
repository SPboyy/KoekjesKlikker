function showEvent(templateId) {
  const source   = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(source);
  const html     = template({});
  document.getElementById("CookieContent").innerHTML = html;
}
   function showChristmass(){
     showEvent("template-Christmass")
  }
    function showEaster(){
    showEvent("template-Easter")
  }
    function showHalloween(){
    showEvent("template-Halloween")
  }
  function showNormal(){
    showEvent("template-NoEvent")
  }


