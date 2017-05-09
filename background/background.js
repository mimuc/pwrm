

var addBtn = document.querySelector('#addEntry');
var addCategory = document.querySelector('#addCategory');
var modalCategory = document.querySelector('#modalCategory');


// add event listeners to buttons 
addBtn.addEventListener('click', addEntry);
addCategory.addEventListener('click', createCategory);
/* call init on page load */
document.addEventListener("DOMContentLoaded", init);


// creates programmatically an entry 
function createEntry(mUrl, mUsername, mCategory, mPassword, mID){
  require(["scripts/modules/storage/entry"], function createEntry(e){
    var test = e.createEntry(mUrl, mUsername, mCategory, mPassword, mID);
  });
}

function deleteCategory(name){
   require(["scripts/modules/storage/sm_category"], function deleteCategory(sm_category){
    sm_category.deleteCategory(name);
  });
}

function moveToCategory(entryID, newCategory){
   require(["scripts/modules/storage/sm_category"], function moveToCategory(sm_category){
    sm_category.moveToCategory(entryID, newCategory);
  });
}



// manually create new category 
function createCategory(){
  var value = modalCategoryName.value;
  require(["scripts/modules/storage/sm_category"], function createCategory(sm_category){
    sm_category.createCategory(value);
  });
 
}

function assignCategory(entryKey, categoryKey){
//TODO
}

/* display previously-saved stored entrys on startup */
function init(){
  //init storage logic
  require(["scripts/modules/storage/storagemanager"], function init(sm){sm.initialize();});

}

/* add new entry when clicked on button */
/* TODO: needs some form checks */
function addEntry(){
  require(["scripts/modules/storage/storagemanager"], function (sm){sm.addEntry();});
}

/* generic error handler */
function onError(error) {
  console.log(error);
}



// function to update entrys 
function updateentry(delentry,newname,newurl) {
  /*
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
  */
}

//receives and answers messages from content_scripts [if needed]
function handleMessage(request, sender, sendResponse) {
  //this message is send on every single page load after the dom was scanned by form-detector.js 
  if(request.subject == 'docInfo' && request.mode == 'login'){
    //check if there is an entry in the local storage that matches the received URL
    sendResponse("copy that");
  }
  if(request.subject == 'showPopup' && request.mode == 'login'){
    //check if there is an entry in the local storage that matches the received URL
    sendResponse("background says: showing Popup");
  }
}

browser.runtime.onMessage.addListener(handleMessage);
