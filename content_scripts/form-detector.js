console.log("form-detector.js injected");
/* trigger storage lookup for matching accounts */
window.addEventListener("onLoad", init());
var submitBtn = document.querySelector('[type=submit]');
submitBtn.addEventListener('click', checkAccount);

var inputUsername;
var inputs;
var hasLogin = false;
var hasSignup = false;


//var URL = document.URL;
// use location.origin to extract base url
//var URL = location.origin;
var parts = location.hostname.split('.');
var subdomain = parts.shift();
var upperleveldomain = parts.join('.');
console.log(upperleveldomain);
var URL = upperleveldomain;
//check against type-attribute 
var attr_name = "email";
var attr_pw = "password";
//if there is no match, check via regex to find inputs
var regex_name = /e-mail$|konto(?!=)|num(?!=)|^email$|name(?!=)|login/;
var regex_pw = /pass/;


function init(){
  findSignup();
}

function findSignup(){
  var forms = document.forms;
  //first check if there are 2 password inputs to determine whether it's a login or a signup
  //false positive on (like facebook) login-signup double page 
  console.log("Number forms on this page: " +forms.length);

  for (i = 0; i < forms.length; ++i) {
    var pwInputs = forms[i].querySelectorAll('input[type="password"]:not([type="hidden"]):not([type="submit"])');
    var allInputs = forms[i].querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    console.log("Form "+ i +" has "+ pwInputs.length +" PW Input and "+ allInputs.length +" other Input Elements.");

    //form is supposed to be a signup form if:
    //there are 2 PW inputs
    //there is 1 PW input and more than 1 other input element in the same form
   
    if(pwInputs.length == 2 || (pwInputs.length == 1 && allInputs.length > 2)){
      console.log("Form " + i + " is a Signup Form.");
    }else if(pwInputs.length == 1){
       console.log("Form " + i + " is a Login Form.");
        lookupStorage(); //calls findLogin(..) in case of existing entry for this url
    }else if(pwInputs.length > 2){
       console.log("Form " + i + " might be a Reset Form.");
    }
    
  }
}


function findLogin(credentials, categoryIcon){
  console.log("Function : findLogin");
//highlight inputs if existing account

//query all forms
var loginForm = document.querySelectorAll('form');

//handle multiple forms (trivial solution: select first in page)
//check if there is a form element. if not query the whole page for inputs
//WARNING: can result in only finding a search field but not the login inputs!
/*
var form = loginForm.item(0);
if(form != null){
 inputs = form.getElementsByTagName('input');
}else{
  console.log("Error getting form: " + data);
  console.log("Querying whole document...");
  inputs = document.getElementsByTagName('input');
}*/
inputs = document.getElementsByTagName('input');
//TODO: add boxes and auto-fill username etc depending on user preferences
for (index = 0; index < inputs.length; ++index) {
  var i = inputs[index];
  //escape submit buttons, hidden inputs
  if(i.type != "submit" && i.type != "hidden"){
  //find username / mail input
  //test by type attribute, if false test as string with regular expression
  if(i.getAttribute("type").toUpperCase() === attr_name.toUpperCase() ||
    new RegExp(regex_name).test(i.outerHTML)){
    inputUsername = i;
  highlightUsername(i, credentials);
} 

}
  //find password input
  if(i.getAttribute("type").toUpperCase() === attr_pw.toUpperCase() ||
    new RegExp(regex_pw).test(i.outerHTML)){
      hasLogin = true;
      highlightPassword(i, credentials, categoryIcon);
    }
  }


/* //if needed: communicate with background.js 
   notifyBackgroundPage();
   */
 }


 function lookupStorage(){
   var requestPromise = browser.storage.local.get();
   requestPromise.then(function(data){
    var cat = data.categories;
    var entries = data.entries;


    if(entries[URL] != null){
      console.log("Found an entry for this URL in local storage.");
      console.log("username is: " + entries[URL].username);

      /* there is a matching URL / account in the storage */
      /* second parameter is the matching between entry.categoryName and categories --> icon */
      findLogin(entries[URL], cat[entries[URL].category][1]);
    }else{
      console.log("No saved entry found for this URL.");
      console.log("URL is: " + entries);
    }

  }, 
  function(data){
    consoloe.log("error: " + entries);
  });
 }

 function highlightUsername(i, credentials){
  console.log("Function : highlightUsername");
  i.style.color = "blue";
  i.style.border = "3px dotted blue";

  var hintbox_div = document.createElement('div');
  var hintbox_p = document.createElement('p');
  var hintbox_p2 = document.createElement('p');
  hintbox_div.setAttribute('class', 'hintbox');
  hintbox_p.textContent = 'Your account(s):';
  hintbox_p2.textContent = credentials.username; 

  hintbox_div.appendChild(hintbox_p);
  hintbox_div.appendChild(hintbox_p2);
  i.parentNode.insertBefore(hintbox_div, i.nextSibling);


    //autofill test

    i.value = credentials.username;
  }

  function highlightPassword(i, credentials, icon){
    i.style.color = "green";
    i.style.border = "3px dotted green";



    var hintbox_div = document.createElement('div');
    var hintbox_p = document.createElement('p');
    var hintbox_p2 = document.createElement('p');
    var hintbox_i = document.createElement('i');
    hintbox_i.setAttribute('class', 'material-icons');
    hintbox_div.setAttribute('class', 'hintbox');
    hintbox_i.textContent = icon;
    hintbox_p.textContent = 'Password Category: ' ;
    hintbox_p2.textContent = credentials.category;

    hintbox_div.appendChild(hintbox_p);
    hintbox_div.appendChild(hintbox_i);
    hintbox_div.appendChild(hintbox_p2);
    i.parentNode.insertBefore(hintbox_div, i.nextSibling);
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

//messaging
function handleResponse(message) {
  console.log(message);
  console.log('Message from the background script:' + message.subject);
}
function handleError(error) {
  console.log('Error: '+ error);
}
function notifyBackgroundPage(e) {
  console.log("Function : notifyBackgroundPage");
  var sending = browser.runtime.sendMessage({
    subject: 'showPopup',
    mode: 'login', //possible other modes: create account, restore pw..
    hasLogin: hasLogin, 
    title: document.title,
    url: URL
  });
  sending.then(handleResponse, handleError);  
}

