window.onload = function() {
  console.log("onload" + Date());
  chrome.tabs.query({active : true, currentWindow: true}, function (tabs) {
    var murl = tabs[0].url;
    var pathArray = murl.split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];
    var entryURL = protocol + '//' + host;
    $('#thisURL').html(entryURL);

  });
}



function openPopup() {
 console.log("openPopup");
 chrome.windows.create({
   "url": "/login/login.html",
   type: "panel",
   height: 600,
   width: 600
 });
}

$('.button-floating').click(function(){
  $('.content').toggleClass('open');

});

$('.manager').on('click', openManagerPage);
$('.popup').on('click', openPopup);


function onCreated(windowInfo) {
  console.log(`Created window: ${windowInfo.id}`);
}

function onError(error) {
  console.log(`Error: ${error}`);
}
