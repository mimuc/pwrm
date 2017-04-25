console.log("form-detector.js injected");

var hasLogin = false;

var URL = document.URL;
//check against type-attribute 
var attr_mail = "email";
var attr_pw = "password";
//if there is no match, check via regex to find inputs
var regex_name = /e-mail$|num(?!=)|^email$|name(?!=)/;
var regex_pw = /pass/;


function getInputInfo(credentials){
//highlight inputs if existing account

//TODO: add boxes and auto-fill username etc depending on user preferences
var inputs = document.getElementsByTagName('input');
for (index = 0; index < inputs.length; ++index) {
    // deal with inputs[index] element.
    var i = inputs[index];

  //console.log(inputs[index].outerHTML);
  if(i.getAttribute("type").toUpperCase() === attr_mail.toUpperCase() ||
    new RegExp(regex_name).test(i.outerHTML)){
      //console.log("username input found -->");
    //testing
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

      //console.log(i);
    }
    if(i.getAttribute("type").toUpperCase() === attr_pw.toUpperCase() ||
      new RegExp(regex_pw).test(i.outerHTML)){
      //console.log("password input found -->");
      //console.log(i);d
       //testing
       hasLogin = true;
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
   }


   notifyBackgroundPage();
 }


 function lookupStorage(){
   var requestPromise = browser.storage.local.get(URL);
   requestPromise.then(function(data){

    if(data[URL] != null){
      console.log("Found an entry for this URL in local storage.");
      console.log("username is: " + data[URL].username);
      getInputInfo(data[URL]);
    }else{
      console.log("No saved entry found for this URL.");
      console.log("URL is: " + URL);
    }
  }, 
  function(data){
    consoloe.log("error: " + data);
  });
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

window.addEventListener("DOMContentLoaded", lookupStorage());
