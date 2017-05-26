/*
Open a new tab, and load "my-page.html" into it.
*/
function openManagerPage() {
  console.log("openManagerPage");
   chrome.tabs.create({
     "url": chrome.extension.getURL("background/background.html")
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
