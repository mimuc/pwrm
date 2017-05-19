console.log("form-detector.js injected");

/* load material iconfont */
var mi = document.createElement('style');
mi.type = 'text/css';
mi.textContent = '@font-face { font-family: material-icons; src: url("'
+ chrome.extension.getURL('content_scripts/material-icons/MaterialIcons-Regular.woff')
+ '"); }';
document.head.appendChild(mi);

/* trigger storage lookup for matching accounts */
window.addEventListener("DOMContentLoaded", init());
//window.addEventListener("DOMSubtreeModified", findForms());
var submitBtn = document.querySelector('[type=submit]');
//check if is submit TODO
//submitBtn.addEventListener('click', checkAccount);

var inputUsername;
var inputs;
var hasLogin = false; 
var hasSignup = false;


//var URL = document.URL;
// use location.origin to extract base url
var URL = location.origin;
console.log(typeof location);
console.log("test");
/*
var murl = document.URL;
murl = murl.split("/")[2]; // Get the hostname
var parsed = psl.parse(murl); // Parse the domain

var URL = parsed.domain;
console.log("parsed domain: " + URL);
*/
//check against type-attribute 
var attr_name = "email";
var attr_pw = "password";
//if there is no match, check via regex to find inputs
var regex_name = /e-mail$|konto(?!=)|num(?!=)|^email$|name(?!=)|login/;
var regex_pw = /pass/;


function init(){
  console.log("Function : init");
  //workaround to wait for DOM Elements being loaded async after DOMContentLoaded
  setTimeout(function() { findForms(); }, 1000);
  //findForms();
  //alternative: DOM Mutation Observer
  //setTimeout(function() { setupObserver(); }, 2000);
}
/*
function setupObserver(){
  console.log("Function : setupObserver");
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  var observer = new MutationObserver(function(mutations) {
   mutations.forEach(function(mutation) {
    if(!isHidden(mutation.target)){
    console.log("inputs shown");
    console.log(mutation.oldValue);
  }
  
  });    
 });
  var config = { attributes: true,attributeOldValue: true, attributeFilter: ['type']};
   //observe all inputs and wait for changes
   var observableInputs = filterHiddenInputs(document.querySelectorAll('input'));
   for(oi=0;oi<observableInputs.length;oi++){
    observer.observe(observableInputs[oi], config);
   }

}
*/
function isHidden(element) {
  return (element.type =='hidden' ||element.offsetParent === null)
}
//consider only inputs that are visible in DOM
function filterHiddenInputs(inputs){
  //http://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  var filteredInputs = [];

  for(ii = 0;ii<inputs.length;ii++){
    if(!isHidden(inputs[ii])){
      filteredInputs.push(inputs[ii]);
    }
  }
  //console.log(filteredInputs);
  return filteredInputs;

}


function findForms(){
  console.log("Function : findForms");
  var forms = document.getElementsByTagName('form');
  console.log(forms);
  //first check if there are 2 password inputs to determine whether it's a login or a signup
  //false positive on (like facebook) login-signup double page 
  console.log("Number forms on this page: " +forms.length);

  for (i = 0; i < forms.length; ++i) {
    var pwInputs = forms[i].querySelectorAll('input[type="password"]:not([type="hidden"]):not([type="submit"])');
    var allInputs = forms[i].querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    
    //console.log(pwInputs);
    //console.log("filtering pwinputs ...");
    var visiblePWInputs = filterHiddenInputs(pwInputs);
    //console.log(allInputs);
    //console.log("filtering allinputs ...");
    var visibleAllInputs = filterHiddenInputs(allInputs);

    console.log("Form "+ i +" has "+ visiblePWInputs.length +" (visible) PW Input and "+ visibleAllInputs.length +" other Input Elements.");
    //form is supposed to be a signup form if:
    //there are 2 PW inputs
    //there is 1 PW input and more than 1 other input element in the same form

    
    if(visiblePWInputs.length == 2 || (visiblePWInputs.length == 1 && visibleAllInputs.length > 2)){
      console.log("Form " + i + " is a Signup Form.");
    }else if(visiblePWInputs.length < 2){
     console.log("Form " + i + " is a Login Form.");
        lookupStorage(forms[i]); //calls findLogin(..) in case of existing entry for this url
      }else if(visiblePWInputs.length > 2){
       console.log("Form " + i + " might be a Reset Form.");
     }

   } //end of for-loop
 }


 function findLogin(form, credentials, categoryIcon){
  console.log("Function : findLogin");
  var inputUsername;
  inputs = form.getElementsByTagName('input');
//TODO: add boxes and auto-fill username etc depending on user preferences
for (index = 0; index < inputs.length; ++index) {
  var i = inputs[index];
  //escape submit buttons, hidden inputs
  if(i.type != "submit" && i.type != "hidden"){
  //find username / mail input
  //test by type attribute, if false test as string with regular expression
  if(i.getAttribute("type").toUpperCase() === attr_name.toUpperCase() ||
    new RegExp(regex_name).test(i.outerHTML)){
    var inputUsername = i;
  highlightUsername(i, credentials);
} 

}
  //find password input
  if(i.getAttribute("type").toUpperCase() === attr_pw.toUpperCase() ||
    new RegExp(regex_pw).test(i.outerHTML)){
    hasLogin = true;
    //check positions
    var pos = "horizontal";
    if($('#'+inputUsername.getAttribute('id')).position().top == $('#'+i.getAttribute('id')).top){
      pos = "vertical";
    }

    showHintbox(i, credentials, categoryIcon, pos);
  }
}


/* //if needed: communicate with background.js 
   notifyBackgroundPage();
   */
 }


 function lookupStorage(form){
   var requestPromise = browser.storage.local.get();
   requestPromise.then(function(data){
    var cat = data.categories;
    var entries = data.entries;

    if(entries[URL] != null){
      console.log("Found an entry for this URL in local storage.");
      console.log("username is: " + entries[URL].username);

      /* there is a matching URL / account in the storage */
      /* second parameter is the matching between entry.categoryName and categories --> icon */
      findLogin(form, entries[URL], cat[entries[URL].category][1]);
    }else{
      console.log("No saved entry found for this URL.");
      console.log(URL);
    }

  }, 
  function(data){
    consoloe.log("error: " + entries);
  });
 }

 function highlightUsername(i, credentials){
  console.log("Function : highlightUsername");
  i.style.color = "black";
  i.style.border = "3px dotted #303F9F";

  //autofill username test
  i.value = credentials.username;
}

// paramenter 'pos': determines the inputs alignments (vertical|horizontal)
function showHintbox(i, credentials, icon, pos){
  i.style.color = "black";
  i.style.border = "3px dotted #303F9F";
  var hintbox;

  if(credentials.password){
   hintbox = '<div class="hintbox"><div class="hintbox_head"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">'+ credentials.category +'</div><div class="grid right"><i id="ic_arrow" class="material-icons">arrow_drop_down</i></div></div><div class="hintbox_content mp-hidden"><p>You used the password from category <strong>'+ credentials.category  +'</strong></p><div id="pwhint_stored"><i class="material-icons hastext">lock</i>Password: ****** <span class="showPW">show</span></div><hr><a href="#">open in manager</a></div></div>';
 }else{
   hintbox = '<div class="hintbox"><div class="hintbox_head"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">'+ credentials.category +'</div><div class="grid right"><i id="ic_arrow" class="material-icons">arrow_drop_down</i></div></div><div class="hintbox_content mp-hidden"><p>You used the password from category <strong>'+ credentials.category  +'</strong></p><div id="pwhint_notstored"><i class="material-icons hastext">lock_open</i> No password stored</div><hr><a href="#">open in manager</a></div></div>';
 }

 if($('#hbpwrm').length){ 

 }else{
  console.log("gibts ned");
  var hintbox_div = document.createElement('div'); 
  var hintbox_w = document.createElement('div');
  hintbox_div.setAttribute('id', 'hbpwrm');
  hintbox_w.innerHTML = hintbox;
  hintbox_div.appendChild(hintbox_w);

  if(pos=="horizontal"){
    i.parentNode.insertBefore(hintbox_div, i.nextSibling);
  }else{

  }


  $('#hbpwrm').click(function(){
    $('.hintbox_head').toggleClass('focused');
    $('.hintbox_content').toggleClass('open');
    $('#ic_arrow').toggleClass('upsideDown');
  });

  $('.showPW').click(function(){
    //TODO: open manager page and show entry (pass url/category?)
  });

}
}




//submit button clicked. Check if there is an entry with this username for this website
function checkAccount(){
  var username = inputUsername.value;
  var requestPromise = browser.storage.local.get();
  requestPromise.then(function(data){
    var cat = data.categories; var entries = data.entries;
    var accountFound = false; var existingUsername;
    for(e in entries){
      if(e === URL){
        accountFound = true;
        existingUsername = entries[e].username;
      }
    }
    //if there was no account found or there is an account for this page but a different username was saved
    if(!accountFound || (accountFound && existingUsername != username)){
      //TODO: how popup "want to add this account?"
     // notifyBackgroundPage();
   }
 });

}


function handleError(error) {
  console.log('Error: '+ error);
}



chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse){
  if(request == "task_detect"){
    //start detector
    init();
  }
}

