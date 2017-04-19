/* initialise variables */

var inputName = document.querySelector('.name');
var inputURL = document.querySelector('.url');
var inputUsername = document.querySelector('.username');
var inputPassword = document.querySelector('.password');

var entryContainer = document.querySelector('.container');

var addBtn = document.querySelector('.add');

/*  add event listeners to buttons */

addBtn.addEventListener('click', addEntry);

/* listen for new website loaded */
function logURL(requestDetails) {
  console.log("Loading: " + requestDetails.url);
}
browser.webRequest.onHeadersReceived.addListener(logURL,
  {urls: ["<all_urls>"]}
  );

/* generic error handler */
function onError(error) {
  console.log(error);
}

/* display previously-saved stored entrys on startup */

initialize();

function initialize() {
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    var entryKeys = Object.keys(results);
   

    for(entryKey of entryKeys) {
      var curValue = results[entryKey];
      displayEntry(entryKey,curValue);
    }
  }, onError);
}

/* Add a entry to the display, and storage */

function addEntry() {

  var entryName = inputName.value;
  var entryURL = inputURL.value;
  var entryUsername = inputUsername.value;
  var entryPassword = inputPassword.value;


  var gettingItem = browser.storage.local.get(entryURL);
  gettingItem.then((result) => {
    var objTest = Object.keys(result);
    if(objTest.length < 1 && entryURL !== '' && entryUsername !== '') {
      entryURL.value = '';
      entryUsername.value = '';
      entryPassword.value = '';
      entryName.value ='';
      var credential = [entryURL,entryUsername, entryPassword];
      storeEntry(entryName, credential);
    }
  }, onError);
}

/* function to store a new entry in storage */

function storeEntry(name, credential) {
  var storingEntry = browser.storage.local.set({ [name] : credential });
  storingEntry.then(() => {
    displayEntry(name, credential);
  }, onError);
}

/* function to display a entry in the entry box */

function displayEntry(name, credential) {

  /* create entry display box */
  var entry = document.createElement('div');
  var entryDisplay = document.createElement('div');
  var entryH = document.createElement('h2');
  var entryPara = document.createElement('p');
  var entryPara2 = document.createElement('p');
  var entryPara3 = document.createElement('p');
  var deleteBtn = document.createElement('button');
  var clearFix = document.createElement('div');

  entry.setAttribute('class','entry');

  entryH.textContent = name;
  entryPara.textContent = credential[0];
  entryPara2.textContent = credential[1];
  entryPara3.textContent = credential[2];

  deleteBtn.setAttribute('class','delete');
  deleteBtn.textContent = 'Delete entry';
  clearFix.setAttribute('class','clearfix');

  entryDisplay.appendChild(entryH);
  entryDisplay.appendChild(entryPara);
  entryDisplay.appendChild(entryPara2);
  entryDisplay.appendChild(entryPara3);
  entryDisplay.appendChild(deleteBtn);
  entryDisplay.appendChild(clearFix);

  entry.appendChild(entryDisplay);

  /* set up listener for the delete functionality */

  deleteBtn.addEventListener('click',function(e){
    evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
    browser.storage.local.remove(name);
  })

  /* create entry edit box */
  var entryEdit = document.createElement('div');
  var entrynameEdit = document.createElement('input');
  var entryurlEdit = document.createElement('textarea');
  var clearFix2 = document.createElement('div');

  var updateBtn = document.createElement('button');
  var cancelBtn = document.createElement('button');

  updateBtn.setAttribute('class','update');
  updateBtn.textContent = 'Update entry';
  cancelBtn.setAttribute('class','cancel');
  cancelBtn.textContent = 'Cancel update';

  entryEdit.appendChild(entrynameEdit);
  entrynameEdit.value = name;
  entryEdit.appendChild(entryurlEdit);
  entryurlEdit.textContent = credential[0];
  entryEdit.appendChild(updateBtn);
  entryEdit.appendChild(cancelBtn);

  entryEdit.appendChild(clearFix2);
  clearFix2.setAttribute('class','clearfix');

  entry.appendChild(entryEdit);

  entryContainer.appendChild(entry);
  entryEdit.style.display = 'none';

  /* set up listeners for the update functionality */

  entryH.addEventListener('click',function(){
    entryDisplay.style.display = 'none';
    entryEdit.style.display = 'block';
  })

  entryPara.addEventListener('click',function(){
    entryDisplay.style.display = 'none';
    entryEdit.style.display = 'block';
  }) 

  cancelBtn.addEventListener('click',function(){
    entryDisplay.style.display = 'block';
    entryEdit.style.display = 'none';
    entrynameEdit.value = name;
    entryurlEdit.value = url;
  })

  updateBtn.addEventListener('click',function(){
    if(entrynameEdit.value !== name || entryurlEdit.value !== url) {
      updateentry(name,entrynameEdit.value,entryurlEdit.value);
      entry.parentNode.removeChild(entry);
    } 
  });
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

