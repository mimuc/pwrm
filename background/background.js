/* initialise variables */
var inputCategory = document.querySelector('.category');
var inputURL = document.querySelector('.url');
var inputUsername = document.querySelector('.username');
var inputPassword = document.querySelector('.password');
var entryContainer = document.querySelector('.container');
var addBtn = document.querySelector('.add');

/*  add event listeners to buttons */
addBtn.addEventListener('click', addEntry);
/* call init on page load */
document.addEventListener("DOMContentLoaded", init);


function createEntry(mUrl, mUsername, mCategory, mPassword){
  require(["storage/entry"], function createEntry(e){
    var test = e.createEntry(mUrl, mUsername, mCategory, mPassword);
     console.log(test);
 
  });
}

createEntry("tester", "A", "B", "C");


/* display previously-saved stored entrys on startup */
function init(){
  require(["storage/storagemanager"], function init(sm){sm.initialize();});
}

/* add new entry when clicked on button */
/* TODO: needs some form checks */
function addEntry(){
  require(["storage/storagemanager"], function (sm){sm.addEntry();});
}

/* generic error handler */
function onError(error) {
  console.log(error);
}



/* function to update entrys */
function updateentry(delentry,newname,newurl) {
  var storingentry = browser.storage.local.set({ [newname] : newurl });
  storingentry.then(() => {
    if(delentry !== newname) {
      var removingentry = browser.storage.local.remove(delentry);
      removingentry.then(() => {
        displayentry(newname, newurl);
      }, onError);
    } else {
      displayentry(newname, newurl);
    }
  }, onError);
}

/* receives and answers messages from content_scripts [if needed]
function handleMessage(request, sender, sendResponse) {
  //this message is send on every single page load after the dom was scanned by form-detector.js 
  if(request.subject == 'docInfo' && request.mode == 'login'){
    //check if there is an entry in the local storage that matches the received URL
    sendResponse("copy that");
  }
}

browser.runtime.onMessage.addListener(handleMessage);
*/