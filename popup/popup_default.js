/*
Open a new tab, and load "my-page.html" into it.
*/
function openManagerPage() {
  console.log("openManagerPage");
   browser.tabs.create({
     "url": browser.extension.getURL("background/background.html")
   });
}

function openPopup() {
   console.log("openPopup");
   browser.windows.create({
     "url": "login.html",
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
