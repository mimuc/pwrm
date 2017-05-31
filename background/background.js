var addBtn = document.querySelector('#addEntry');
var addPWD = document.querySelector('#btnAddPWD');
var addCategory = document.querySelector('#addCategory');
var modalCategory = document.querySelector('#modalCategory');

browser.runtime.onMessage.addListener(handleMessage);

/* call init on page load */
$(document).ready(function() {
  setup();
});

function test(){
  console.log("test");
}


function showPWDInput(){
  var storePW = ($('#btnAddPWD').text() === 'add password') ? true : false;
  var txt = (storePW) ? 'remove password' : 'add password';
  var msg = (storePW) ? 'A category password will be stored.' : 'No password will be stored for this category and its entries.';
  var icon = (storePW) ? 'lock':'lock_open';
  $('#btnAddPWD').html(txt);
  $('#pw-hint span').html(msg);
  $('#pw-hint i').html(icon);
  $('#category-pwd').val('');
  $('#enter-category-pwd').toggleClass('hidden');
}
//searches for entries and displays results matching the typed letters
function searchAsync(value){
  console.log("searchAsync: " + value);
}

function clearInputs(){
  $('input').val('');
}
// creates programmatically an entry 
function createEntry(mUrl, mUsername, mCategory, mPassword, mID){
  require(["scripts/modules/storage/entry"], function createEntry(e){
    var test = e.createEntry(mUrl, mUsername, mCategory, mPassword, mID);
  });
}

function changeCategoryIcon(catName, iconName){
 require(["scripts/modules/storage/sm_category"], function changeCategoryIcon(sm_category){
  sm_category.changeCategoryIcon(catName, iconName);
});
}

function deleteCategory(name){
 require(["scripts/modules/storage/sm_category"], function deleteCategory(sm_category){
  sm_category.deleteCategory(name);
});
}

function renameCategory(newName){
 require(["scripts/modules/storage/sm_category"], function deleteCategory(sm_category){
  sm_category.deleteCategory(name);
});
}


function moveToCategory(entryID, newCategory){
 require(["scripts/modules/storage/sm_category"], function moveToCategory(sm_category){
  sm_category.moveToCategory(entryID, newCategory);
});
}

//listen for tab changes to trigger form-detection (no reload needed)
function handleActivated(activeInfo) {
  console.log("Tab " + activeInfo.tabId +" was activated");
  //TODO: pass message to content script to trigger form-detection
  sendMessage("task_detect");
}

browser.tabs.onActivated.addListener(handleActivated);

function sendMessage(msg) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, msg);
  });
}

// manually create new category 
function createCategory(){
  var value = modalCategoryName.value;
  var pw; 
  if($('#enter-category-pwd').hasClass('hidden')){ pw = null;}else{pw = $('#category-pwd').val();}

  require(["scripts/modules/storage/sm_category"], function createCategory(sm_category){
    sm_category.createCategory(value, pw, $('#modalCategory').hasClass('new'));
  });

}

function assignCategory(entryKey, categoryKey){
//TODO
}

/* display previously-saved stored entrys on startup */
function setup(){

  clearInputs(); 

  // add event listeners to buttons and inputs
  addPWD.addEventListener('click', showPWDInput);
  addBtn.addEventListener('click', addEntry);
  addCategory.addEventListener('click', createCategory);


  // add radio button listener (modal entry)
  $("#radio-form :input").change(function() {
    $('.option-pwd').toggleClass('hidden'); 
    $('.option-category').toggleClass('hidden'); 
  });

  //listen for searchfield input
  $('#search').on('keyup', function() {
    if (this.value.length > 0) searchAsync(this.value);
  });

  // reconfigure radiogroups
  $('#optionsRadios1').prop('checked',true); 
  //init storage logic
  require(["scripts/modules/storage/storagemanager"], function init(sm){
    sm.initialize();
  });
}

/* add new entry when clicked on button */
/* TODO: needs some form checks */
function addEntry(){
  require(["scripts/modules/storage/storagemanager"], function (sm){
    sm.addEntry();
  });
}

/* add new entry when clicked on button */
/* TODO: needs some form checks */
function quickAddEntry(murl, musername, mcat, mpw){
  console.log(murl);
  require(["scripts/modules/storage/storagemanager"], function (sm){
      sm.quickAddEntry(murl, musername, mcat, mpw);
  });
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
function onError(e){
  console.log(e);
}
//receives and answers messages from content_scripts [if needed]
function handleMessage(message, sender, sendResponse) {
  console.log(message.task);
  if(message.task == 'store'){
    console.log(message.url);
    quickAddEntry(message.url, message.username, message.cat, message.pw);
    sendResponse("Saving entry");
  }

}
//programmatically preselect options in dropdown
function setSelectedIndex(select, index){
  select.options[index-1].selected = true;
  return;
}
