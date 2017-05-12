/*
Open a new tab, and load "my-page.html" into it.
*/
function openManagerPage() {
  //console.log("injecting");
   browser.tabs.create({
     "url": browser.extension.getURL("background/background.html")
   });

}

function openPopup() {
  //console.log("injecting");
   browser.windows.create({
     "url": "login.html",
      type: "popup",
      height: 600,
      width: 600
   });
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("manager")) {
    console.log("opening manager page");
     openManagerPage();
    }
     if (e.target.classList.contains("popup")) {
    console.log("opening popup page");
     openPopup();
    }
  });

function onCreated(windowInfo) {
  console.log(`Created window: ${windowInfo.id}`);
}

function onError(error) {
  console.log(`Error: ${error}`);
}
