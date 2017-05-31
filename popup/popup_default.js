var HttpClient;
var requestURL = "https://icons.better-idea.org/allicons.json?url=";
var fab_wrapper = $('#fab_wrapper');
$(document).ready(function($) {
  $('.manager').on('click', openPopup);
  fillDropdown();

  /* load material iconfont */
  var mi = document.createElement('style');
  mi.type = 'text/css';
  mi.textContent = '@font-face { font-family: material-icons; src: url("'
  + chrome.extension.getURL('content_scripts/material-icons/MaterialIcons-Regular.woff')
  + '"); }';
  document.head.appendChild(mi);

  // add radio button listener (modal entry)
  $("#radio-form :input").change(function() {
    $('.option-pwd').toggleClass('hidden'); 
    $('.option-category').toggleClass('hidden'); 
  });

  $('.button-floating').on('click', function(){
    //store entry
    if(fab_wrapper.hasClass('slide')){
      triggerStore();
    }
    fab_wrapper.toggleClass('slide');
    $('.button-floating').toggleClass('fab_checked');
    $('.mid').toggleClass('open');
    $('.mid .forms').toggle('fast', function() {
      $('.mid .forms #enterName').focus();
    });
  });
});
window.onload = function() {

  HttpClient = function() {
    this.get = function(mpURL, mpCallback) {
      var mpHttpRequest = new XMLHttpRequest();
      mpHttpRequest.onreadystatechange = function() { 
        if(mpHttpRequest.status === 404){
          mpCallback(null);
        }else if (mpHttpRequest.readyState == 4 && mpHttpRequest.status == 200)
        mpCallback(mpHttpRequest.responseText);
      }
      mpHttpRequest.open( "GET", mpURL, true );            
      mpHttpRequest.send( null );
    }
  }

  chrome.tabs.query({active : true, currentWindow: true}, function (tabs) {
    var murl = tabs[0].url;
    var pathArray = murl.split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];
    var entryURL = protocol + '//' + host;
    $('#thisURL').html(entryURL);

    checkAccount(entryURL);
    loadIcon(entryURL);
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

// Check if there is an entry with this username for this website
function checkAccount(URL){
  var requestPromise = browser.storage.local.get();
  requestPromise.then(function(data){
    var cat = data.categories; var entries = data.entries;
    var accountFound = false; var username;
    for(e in entries){
      if(e === URL){
        accountFound = true;
        username = entries[e].username;
      }
    }
    //if there was no account found or there is an account for this page but a different username was saved
    if(accountFound){
      //TODO: how popup "want to add this account?"
      $('#hint').html("You stored an account for this website.");
    }else{
      $('#hint').html("Add Entry for this website?");



    }
  });

}

function loadIcon(murl){
  var client = new HttpClient();
  var request = requestURL + murl;
  client.get(request, function(response) {
          // console.log(JSON.parse(response).icons[0].url);
          
          favIcon = "http://placehold.it/50/ffffff?text="+murl.substring(0,1);
          var res = JSON.parse(response);
          if(res != null && res.icons != null && res.icons[0] != null){
            //console.log(response);
            favIcon = JSON.parse(response).icons[0].url;
          }else{
            console.log("fallback to placeholder");
            //TODO create initial-placeholder
            favIcon = "http://placehold.it/50/ffffff?text="+murl.substring(0,1);
          }

          $('.placeholder-img').attr('src', favIcon);
          
        });
}

// $('.button-floating').click(function(){
//   $('.content').toggleClass('open');
// });


function onCreated(windowInfo) {
  console.log(`Created window: ${windowInfo.id}`);
}

function onError(error) {
  console.log(`Error: ${error}`);
}


function fillDropdown(){
  var gettingCategories = browser.storage.local.get("categories");
  gettingCategories.then(function(result){

    var categories = result.categories;
    $('#categoryDropdown').empty();
    for(c in categories){
      var e = document.createElement('option');
      e.textContent = c;
      document.querySelector('#categoryDropdown').append(e);

    }
  }, onError);
}

function triggerStore(){
  var selectedRadio = document.querySelector('.radio-option:not(.hidden)');
  var selectedOption = selectedRadio.getAttribute("value");
  var entryCategory, password, entryURL;

  if(selectedOption == "option-category"){
    var inputCategoryDropdown = document.querySelectorAll('option:checked');
    entryCategory = inputCategoryDropdown[0].value;

  }else{ //option-pwd
    password =  document.querySelector('#enterPWD').value;
    useUniquePWD = true;
  }

    chrome.tabs.query({active : true, currentWindow: true}, function (tabs) {
    var murl = tabs[0].url;
    var pathArray = murl.split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];
    entryURL = protocol + '//' + host;

    chrome.runtime.sendMessage(
    {task: "store",
    url: entryURL,
    username: $('#enterName').val(),
    cat: entryCategory,
    pw: password
  }, function (response) {
    console.log(response);
  });
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