console.log("form-detector.js injected");


var hasLogin = false;


//var URL = document.URL;
// use location.origin to extract base url
var URL = location.origin;

console.log(URL);
//check against type-attribute 
var attr_name = "email";
var attr_pw = "password";
//if there is no match, check via regex to find inputs
var regex_name = /e-mail$|num(?!=)|^email$|name(?!=)|login/;
var regex_pw = /pass/;


function findLogin(credentials){
//highlight inputs if existing account

//query all forms
var loginForm = document.querySelectorAll('form');
var inputs;
//handle multiple forms (trivial solution: select first in page)
//check if there is a form element. if not query the whole page for inputs
var form = loginForm.item(0);
if(form != null){
 inputs = form.getElementsByTagName('input');
}else{
  console.log("Error getting form: " + data);
  console.log("Querying whole document...");
  inputs = document.getElementsByTagName('input');
}

//TODO: add boxes and auto-fill username etc depending on user preferences
for (index = 0; index < inputs.length; ++index) {
  var i = inputs[index];

    //find username / mail input
    //test by type attribute, if false test as string with regular expression
    if(i.getAttribute("type").toUpperCase() === attr_name.toUpperCase() ||
      new RegExp(regex_name).test(i.outerHTML)){
      //console.log("username input found -->");
     //testing
      highlightUsername(i, credentials);

  }
  //find password input
  if(i.getAttribute("type").toUpperCase() === attr_pw.toUpperCase() ||
    new RegExp(regex_pw).test(i.outerHTML)){
        //console.log("password input found -->");
        //testing
        hasLogin = true;
        highlightPassword(i, credentials);
       }
     }


/* //if needed: communicate with background.js 
   notifyBackgroundPage();
   */
 }


 function lookupStorage(){
   var requestPromise = browser.storage.local.get(URL);
   requestPromise.then(function(data){

    if(data[URL] != null){
      console.log("Found an entry for this URL in local storage.");
      console.log("username is: " + data[URL].username);
      
      /* there is a matching URL / account in the storage */
      findLogin(data[URL]);
    }else{
      console.log("No saved entry found for this URL.");
      console.log("URL is: " + URL);
    }

  }, 
  function(data){
    consoloe.log("error: " + data);
  });
 }

 function highlightUsername(i, credentials){
  i.style.color = "blue";
  i.style.border = "3px dotted blue";

  var hintbox_div = document.createElement('div');
  var hintbox_p = document.createElement('p');
  hintbox_div.setAttribute('class', 'hintbox');
  hintbox_p.textContent = 'You have an account as ' + credentials.username ;

  hintbox_div.appendChild(hintbox_p);
  i.parentNode.insertBefore(hintbox_div, i.nextSibling);


    //autofill test

    i.value = credentials.username;
  }

  function highlightPassword(i, credentials){
    i.style.color = "green";
    i.style.border = "3px dotted green";

    i.value = credentials.password;

    var hintbox_div = document.createElement('div');
    var hintbox_p = document.createElement('p');
    hintbox_div.setAttribute('class', 'hintbox');
    hintbox_p.textContent = 'You used the password from category ' + credentials.category ;

    hintbox_div.appendChild(hintbox_p);
    i.parentNode.insertBefore(hintbox_div, i.nextSibling);
  }

//messaging
function handleResponse(message) {
  console.log(message);
 /* console.log('Message from the background script:' + message.subject);
   console.log(message.result);
  if(message.subject == 'credentials'){
    console.log("received credentials from local storage");
    console.log(result);
  }
  */

}
function handleError(error) {
  console.log('Error: '+ error);
}
function notifyBackgroundPage(e) {
  var sending = browser.runtime.sendMessage({
    subject: 'docInfo',
    mode: 'login', //possible other modes: create account, restore pw..
    hasLogin: hasLogin, 
    title: document.title,
    url: document.URL
  });
  sending.then(handleResponse, handleError);  
}

/* trigger storage lookup for matching accounts */
window.addEventListener("DOMContentLoaded", lookupStorage());