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

var inputUsername, inputs;
var hasLogin = false; 
var hasSignup = false;

//var URL = document.URL;
// use location.origin to extract base url
var URL = location.origin;
console.log(typeof location);

//check against type-attribute 
var attr_name = "email";
var attr_pw = "password";
//if there is no match, check via regex to find inputs
var regex_name = /e-mail$|konto(?!=)|num(?!=)|^email$|name(?!=)|login/;
var regex_pw = /pass|password/;


function init(){
  console.log("Function : init");
  //workaround to wait for DOM Elements being loaded async after DOMContentLoaded
  setTimeout(function() { findForms(); }, 1000);
}

function findForms(){
  console.log("Function : findForms");
  var forms = document.getElementsByTagName('form');
  console.log(forms);
  //first check if there are 2 password inputs to determine whether it's a login or a signup
  //false positives on (like facebook) login-signup double page 
  console.log("Number forms on this page: " +forms.length);

  // trigger action when form is submitted
  $('form').submit(function(ev) {
    ev.preventDefault(); // stop the form from submitting
    // checkAccount();
    // TODO
    // console.log("submit detected");
    this.submit(); 
  });

  for (i = 0; i < forms.length; ++i) {
    var pwInputs = forms[i].querySelectorAll('input[type="password"]:not([type="hidden"]):not([type="submit"])');
    var allInputs = forms[i].querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    var visiblePWInputs = filterHiddenInputs(pwInputs);
    var visibleAllInputs = filterHiddenInputs(allInputs);

    // console.log("Form "+ i +" has "+ visiblePWInputs.length +" (visible) PW Input and "+ visibleAllInputs.length +" other Input Elements.");
    
    if(visiblePWInputs.length < 2 && visibleAllInputs.length == 2){
      console.log("Form " + i + " is a Login Form.");
      lookupStorage(forms[i]); //calls findInput(..) in case of existing entry for this url
    }else 

    if(visiblePWInputs.length == 2 || (visiblePWInputs.length == 1 && visibleAllInputs.length > 2)){
      console.log("Form " + i + " is a Signup Form.");
      findInput(forms[i], null, null, null);
    }else 

    if(visiblePWInputs.length > 2){
      console.log("Form " + i + " might be a Reset Form.");
    }

   } //end of for-loop
 }


 function findInput(form, credentials, categories, categoryIcon){
  console.log("Function : findInput (credentials: " + credentials +")");
  var inputUsername;
  inputs = form.getElementsByTagName('input');
//TODO: add boxes and auto-fill username etc depending on user preferences
for (index = 0; index < inputs.length; ++index) {
  var i = inputs[index];
  //escape submit buttons, hidden inputs
  if(i.type != "submit" && i.type != "hidden"){
  //find username / mail input
  //test by type attribute, if false test as string with regular expression
  if(credentials != null){
    if(i.getAttribute("type").toUpperCase() === attr_name.toUpperCase() ||
      new RegExp(regex_name).test(i.outerHTML)){
      var inputUsername = i;
    highlightUsername(i, credentials);
  } 
}

}
  //find password input
  if(i.getAttribute("type").toUpperCase() === attr_pw.toUpperCase() ||
    new RegExp(regex_pw).test(i.outerHTML)){
    if(credentials != null){
      showHintbox(i, credentials, categories, categoryIcon);
    }else{
      showSignupHintbox(i);
    }
  }
}


/* //if needed: communicate with MVC_Controller_Managerpage.js 
   notifyBackgroundPage();
   */
 }


 function lookupStorage(form){
   var requestPromise = browser.storage.local.get();
   requestPromise.then(function(data){
    var cat = data.categories;
    var entries = data.entries;
    var foundEntry = null;
    for(key in entries){
      // !! multiple possible
      if(entries[key].url == URL) foundEntry = entries[key];
    }
    if(foundEntry != null){
      console.log(foundEntry);
      console.log("Found an entry for this URL in local storage.");
      console.log("username is: " + foundEntry.username);
      if(foundEntry.category == null){
        //use unique icon
        findInput(form, foundEntry, cat, 'lock');
      }else{
        /* there is a matching URL / account in the storage */
        /* second parameter is the matching between entry.categoryName and categories --> icon */
        findInput(form, foundEntry, cat, cat[foundEntry.category][1]);
      }
    }else{
      console.log("No saved entry found for this URL.");
      console.log(URL);
    }

  }, 
  function(data){
    console.log("error: " + entries);
  });
 }

 function highlightUsername(i, credentials){
  console.log("Function : highlightUsername");
  // i.style.color = "black";
  // i.style.border = "3px dotted #303F9F";
  i.classList.add('highlightInput');

  //autofill username test
  i.value = credentials.username;
  i.html = credentials.username;
}

function showHintbox(i, credentials, categories, icon){
  console.log("Function : showHintbox");

  // i.onmouseover = function(){i.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iMTcxMC4yNThweCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTI2MiAxNzEwLjI1ODsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEyNjIgMTcxMC4yNTgiIHdpZHRoPSIxMjYycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJsb2NrIj48Zz48cGF0aCBkPSJNMTE5Ni40OTUsNzEzLjI1OEgxMDkwVjQ1OS41OTJjMC0yNTMuMjg1LTIwNS44MDItNDU5LjM1LTQ1OS4wMDEtNDU5LjM1QzM3Ny43OTksMC4yNDIsMTcyLDIwNi40NDIsMTcyLDQ1OS44OTJ2MjUzLjM2NiAgICBINjYuNjg2QzMwLjE5NSw3MTMuMjU4LDAsNzQyLjI0MSwwLDc3OC43MzF2NzY2LjQyYzAsOTEuMDc5LDc0LjcxMiwxNjUuMTA2LDE2NS43OTIsMTY1LjEwNmg5MzEuNTk3ICAgIGM5MS4wOCwwLDE2NC42MTEtNzQuMDI3LDE2NC42MTEtMTY1LjEwNnYtNzY2LjQyQzEyNjIsNzQyLjI0MSwxMjMyLjk4NSw3MTMuMjU4LDExOTYuNDk1LDcxMy4yNTh6IE0zMDQsNDU5Ljg5MiAgICBjMC0xODAuNTg4LDE0Ni42NjQtMzI3LjUwOCwzMjYuOTk5LTMyNy41MDhDODExLjMzNSwxMzIuMzg0LDk1OCwyNzkuMTY4LDk1OCw0NTkuNTkydjI1My42NjZIMzA0VjQ1OS44OTJ6IE0xMTMwLDE1NDUuMTUxICAgIGMwLDE4LjIxOC0xNC4zOTUsMzMuMTA2LTMyLjYxMSwzMy4xMDZIMTY1Ljc5MmMtMTguMjE2LDAtMzMuNzkyLTE0Ljg4OS0zMy43OTItMzMuMTA2Vjg0NS4yNThoOTk4VjE1NDUuMTUxeiIvPjxwYXRoIGQ9Ik02MzEsMTQwOS43MDdjMzYuNDkxLDAsNjYtMjkuNTgsNjYtNjYuMDcxdi0yMzcuODU0YzAtMzYuNDktMjkuNTEtNjYuMDctNjYtNjYuMDdjLTM2LjQ5LDAtNjYsMjkuNTgtNjYsNjYuMDd2MjM3Ljg1NCAgICBDNTY1LDEzODAuMTI3LDU5NC41MDksMTQwOS43MDcsNjMxLDE0MDkuNzA3eiIvPjwvZz48L2c+PGcgaWQ9IkxheWVyXzEiLz48L3N2Zz4=')";
    // i.onmousemove = function(){i.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDc1IDc1IiBoZWlnaHQ9Ijc1cHgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1IDc1IiB3aWR0aD0iNzVweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGcgaWQ9IkxheWVyXzEiPjxnPjxnPjxnPjxnPjxwYXRoIGQ9Ik01OS4xODgsNDUuMDFjMCwyLjAzMS0xLjY0OCwzLjY4LTMuNjgxLDMuNjhsMCwwYy0yLjAzMywwLTMuNjgxLTEuNjQ4LTMuNjgxLTMuNjh2LTQuNDA2ICAgICAgIGMwLTIuMDMzLDEuNjQ3LTMuNjgyLDMuNjgxLTMuNjgybDAsMGMyLjAzMiwwLDMuNjgxLDEuNjQ4LDMuNjgxLDMuNjgyVjQ1LjAxeiIgZmlsbD0iI0YyRDFDOSIvPjwvZz48Zz48cGF0aCBkPSJNNTUuNTA3LDQ5LjQzOWMtMi40NDMsMC00LjQzMS0xLjk4Ny00LjQzMS00LjQzdi00LjQwNmMwLTIuNDQ0LDEuOTg4LTQuNDMyLDQuNDMxLTQuNDMyICAgICAgIHM0LjQzMSwxLjk4OCw0LjQzMSw0LjQzMnY0LjQwNkM1OS45MzgsNDcuNDUyLDU3Ljk1LDQ5LjQzOSw1NS41MDcsNDkuNDM5eiBNNTUuNTA3LDM3LjY3MmMtMS42MTYsMC0yLjkzMSwxLjMxNS0yLjkzMSwyLjkzMiAgICAgICB2NC40MDZjMCwxLjYxNSwxLjMxNCwyLjkzLDIuOTMxLDIuOTNzMi45MzEtMS4zMTQsMi45MzEtMi45M3YtNC40MDZDNTguNDM4LDM4Ljk4Nyw1Ny4xMjMsMzcuNjcyLDU1LjUwNywzNy42NzJ6IiBmaWxsPSIjMDkzMjYwIi8+PC9nPjwvZz48Zz48Zz48cGF0aCBkPSJNMTguMTQ2LDQ1LjAxYzAsMi4wMzEtMS42NDcsMy42OC0zLjY4LDMuNjhsMCwwYy0yLjAzMywwLTMuNjgyLTEuNjQ4LTMuNjgyLTMuNjh2LTQuNDA2ICAgICAgIGMwLTIuMDMzLDEuNjQ4LTMuNjgyLDMuNjgyLTMuNjgybDAsMGMyLjAzMiwwLDMuNjgsMS42NDgsMy42OCwzLjY4MlY0NS4wMXoiIGZpbGw9IiNGMkQxQzkiLz48L2c+PGc+PHBhdGggZD0iTTE0LjQ2Nyw0OS40MzljLTIuNDQ0LDAtNC40MzItMS45ODctNC40MzItNC40M3YtNC40MDZjMC0yLjQ0NCwxLjk4OC00LjQzMiw0LjQzMi00LjQzMiAgICAgICBjMi40NDIsMCw0LjQzLDEuOTg4LDQuNDMsNC40MzJ2NC40MDZDMTguODk2LDQ3LjQ1MiwxNi45MDksNDkuNDM5LDE0LjQ2Nyw0OS40Mzl6IE0xNC40NjcsMzcuNjcyICAgICAgIGMtMS42MTcsMC0yLjkzMiwxLjMxNS0yLjkzMiwyLjkzMnY0LjQwNmMwLDEuNjE1LDEuMzE1LDIuOTMsMi45MzIsMi45M2MxLjYxNSwwLDIuOTMtMS4zMTQsMi45My0yLjkzdi00LjQwNiAgICAgICBDMTcuMzk2LDM4Ljk4NywxNi4wODIsMzcuNjcyLDE0LjQ2NywzNy42NzJ6IiBmaWxsPSIjMDkzMjYwIi8+PC9nPjwvZz48L2c+PGc+PHBhdGggZD0iTTE0LjI2MiwzMC4yMTVWNTAuNTFjMCwxMC4wNjgsOC4xNjUsMTguMjM0LDE4LjIzNSwxOC4yMzRoNC45NzljMTAuMDcsMCwxOC4yMzUtOC4xNjYsMTguMjM1LTE4LjIzNCAgICAgVjMwLjIxNUgxNC4yNjJ6IiBmaWxsPSIjRjBGQUZGIi8+PC9nPjxnPjxwYXRoIGQ9Ik0xNC4yNjIsNDUuMzY5YzAsMTAuMDcsOC4xNjUsMTguMjM2LDE4LjIzNSwxOC4yMzZoNC45NzljMTAuMDcsMCwxOC4yMzUtOC4xNjYsMTguMjM1LTE4LjIzNlYzMC4yMTUgICAgIEgxNC4yNjJWNDUuMzY5eiIgZmlsbD0iI0Q5RjFGRiIvPjwvZz48Zz48cGF0aCBkPSJNMzQuOTg4LDI4Ljc5N2MtMTEuMzk4LDAtMjAuNjM5LDMuMDg2LTIwLjYzOSw2Ljg4OXY0LjUwOGMwLTMuODAzLDkuMjQtNi44ODksMjAuNjM5LTYuODg5ICAgICBjMTEuMzk2LDAsMjAuNjM1LDMuMDg2LDIwLjYzNSw2Ljg4OXYtNC41MDhDNTUuNjIzLDMxLjg4Myw0Ni4zODQsMjguNzk3LDM0Ljk4OCwyOC43OTd6IiBmaWxsPSIjQUVEQ0ZGIi8+PC9nPjxnPjxwYXRoIGQ9Ik0zOC44OTQsNDIuMjgzSDMxLjA4Yy0xLjE2OCwwLTIuMjY3LDAuMjkxLTMuMjMyLDAuNzk5YzAuMTQsMS44NTQsMS42NjksMy4zMTYsMy41NTcsMy4zMTZoNy4xNjYgICAgIGMxLjg4NiwwLDMuNDE2LTEuNDYzLDMuNTU1LTMuMzE2QzQxLjE1OSw0Mi41NzQsNDAuMDYxLDQyLjI4MywzOC44OTQsNDIuMjgzeiIgZmlsbD0iI0FFRENGRiIvPjwvZz48Zz48cGF0aCBkPSJNMTkuODA5LDMwLjIxNXYxNC44NjNjMCwzLjg4NywxLjY3NCw3LjM3Nyw0LjMyNSw5LjgxNnYtNS42NjZjMC0zLjgzNiwzLjEwOS02Ljk0NSw2Ljk0Ni02Ljk0NWg3LjgxMyAgICAgYzMuODM1LDAsNi45NDYsMy4xMDksNi45NDYsNi45NDV2NS42NjZjMi42NTEtMi40NDEsNC4zMjQtNS45Myw0LjMyNC05LjgxNlYzMC4yMTVIMTkuODA5eiIgZmlsbD0iI0YyRDFDOSIvPjwvZz48Zz48cGF0aCBkPSJNMTkuODA5LDMxLjAyOXY0LjUwOGMzLjc3Mi0xLjM2OSw5LjE2Ny0yLjIzMiwxNS4xOC0yLjIzMmM2LjAxLDAsMTEuNDA0LDAuODYzLDE1LjE3NiwyLjIzMnYtNC41MDggICAgIGMtMC44MTgtMC4yOTctMS43MS0wLjU2OC0yLjY3MS0wLjgxNEgyMi40OEMyMS41MiwzMC40NjEsMjAuNjI3LDMwLjczMiwxOS44MDksMzEuMDI5eiIgZmlsbD0iI0U4QjZBQyIvPjwvZz48Zz48cGF0aCBkPSJNNDUuODQsNTUuNjQ1Yy0wLjEwMiwwLTAuMjA1LTAuMDIxLTAuMzAxLTAuMDYzYy0wLjI3Mi0wLjEyLTAuNDQ5LTAuMzg5LTAuNDQ5LTAuNjg3di01LjY2NiAgICAgYzAtMy40MTYtMi43OC02LjE5NS02LjE5Ni02LjE5NUgzMS4wOGMtMy40MTcsMC02LjE5NiwyLjc3OS02LjE5Niw2LjE5NXY1LjY2NmMwLDAuMjk4LTAuMTc2LDAuNTY3LTAuNDQ5LDAuNjg3ICAgICBjLTAuMjcxLDAuMTE5LTAuNTksMC4wNjctMC44MDktMC4xMzVjLTIuOTAzLTIuNjctNC41NjctNi40NS00LjU2Ny0xMC4zNjhWMzAuMjE1YzAtMC40MTQsMC4zMzYtMC43NSwwLjc1LTAuNzVoMzAuMzU1ICAgICBjMC40MTQsMCwwLjc1LDAuMzM2LDAuNzUsMC43NXYxNC44NjNjMCwzLjkxNy0xLjY2NSw3LjY5Ni00LjU2NiwxMC4zNjhDNDYuMjA3LDU1LjU3Niw0Ni4wMjQsNTUuNjQ1LDQ1Ljg0LDU1LjY0NXogICAgICBNMjAuNTU5LDMwLjk2NXYxNC4xMTNjMCwyLjg4OCwxLjAxMyw1LjY5MiwyLjgyNSw3LjkyNnYtMy43NzVjMC00LjI0MywzLjQ1My03LjY5NSw3LjY5Ni03LjY5NWg3LjgxMyAgICAgYzQuMjQ0LDAsNy42OTYsMy40NTIsNy42OTYsNy42OTV2My43NzRjMS44MTItMi4yMzQsMi44MjQtNS4wMzgsMi44MjQtNy45MjVWMzAuOTY1SDIwLjU1OXoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTQ1Ljg0LDU5LjgxMmMtMC40MTQsMC0wLjc1LTAuMzM2LTAuNzUtMC43NXYtNS42NjhjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NXMwLjc1LDAuMzM2LDAuNzUsMC43NSAgICAgdjUuNjY4QzQ2LjU5LDU5LjQ3Nyw0Ni4yNTQsNTkuODEyLDQ1Ljg0LDU5LjgxMnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTI0LjEzNCw1OS44MTJjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzV2LTUuNjY4YzAtMC40MTQsMC4zMzYtMC43NSwwLjc1LTAuNzVzMC43NSwwLjMzNiwwLjc1LDAuNzUgICAgIHY1LjY2OEMyNC44ODQsNTkuNDc3LDI0LjU0OCw1OS44MTIsMjQuMTM0LDU5LjgxMnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTM3LjQ3Niw2OS40OTRoLTQuOTc5Yy0xMC40NjksMC0xOC45ODUtOC41MTctMTguOTg1LTE4Ljk4NFYzMC4yMTVjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NWg0MS40NDkgICAgIGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1VjUwLjUxQzU2LjQ2MSw2MC45NzgsNDcuOTQ0LDY5LjQ5NCwzNy40NzYsNjkuNDk0eiBNMTUuMDEyLDMwLjk2NVY1MC41MSAgICAgYzAsOS42NDEsNy44NDQsMTcuNDg0LDE3LjQ4NSwxNy40ODRoNC45NzljOS42NDIsMCwxNy40ODUtNy44NDMsMTcuNDg1LTE3LjQ4NFYzMC45NjVIMTUuMDEyeiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48Zz48Zz48Zz48cGF0aCBkPSJNMzQuOTg4LDIzLjUwOGMtMTEuMzk4LDAtMjAuNjM5LDMuMDg2LTIwLjYzOSw2Ljg4OXY2LjUyNWgwLjAyN2MwLjI5My0zLjcxOSw5LjM5Ni02LjcwNywyMC42MTEtNi43MDcgICAgICAgYzExLjIxMSwwLDIwLjMxNCwyLjk4OCwyMC42MDcsNi43MDdoMC4wMjd2LTYuNTI1QzU1LjYyMywyNi41OTQsNDYuMzg0LDIzLjUwOCwzNC45ODgsMjMuNTA4eiIgZmlsbD0iI0Y3RjVEQyIvPjwvZz48Zz48cGF0aCBkPSJNMzQuOTg4LDI1LjcwN2MtMTEuMzk4LDAtMjAuNjM5LDMuMDg2LTIwLjYzOSw2Ljg4OXY0LjUwOGMwLTMuODAzLDkuMjQtNi44ODksMjAuNjM5LTYuODg5ICAgICAgIGMxMS4zOTYsMCwyMC42MzUsMy4wODYsMjAuNjM1LDYuODg5di00LjUwOEM1NS42MjMsMjguNzkzLDQ2LjM4NCwyNS43MDcsMzQuOTg4LDI1LjcwN3oiIGZpbGw9IiNFQUU4QzMiLz48L2c+PGc+PGc+PHBhdGggZD0iTTM0Ljk4OCwyMy41MDhjOC4zOTIsMCwxNS42MDIsMS42OCwxOC44Myw0LjA3OGMtMC40NDUtMS42MDQtMC42ODgtMy4yNzEtMC42ODgtNSAgICAgICAgYzAtMy4yMTksMC44MjgtNi4yNSwyLjI2LTguOTYzYy00LjExNS00LjQ5OC0xMC4yODktNy4zNjctMTcuMTk3LTcuMzY3Yy0xMi4zOTUsMC0yMi40MzgsOS4yMDctMjIuNDM4LDIwLjU2OCAgICAgICAgYzAsMC4zNDQsMC4wMzcsMC42OTEsMC4wNTUsMS4wNDFDMTguODQ0LDI1LjMxNCwyNi4yNywyMy41MDgsMzQuOTg4LDIzLjUwOHoiIGZpbGw9IiNFODM4NjIiLz48L2c+PC9nPjxnPjxwYXRoIGQ9Ik0zOC4xOTMsMTAuMjQ2Yy0xMS4yNDYsMC0yMC41NTUsNy41NzYtMjIuMTg0LDE3LjQ2OWMzLjE0Mi0yLjQ3MSwxMC40MzQtNC4yMDcsMTguOTc5LTQuMjA3ICAgICAgIGM3Ljg1NSwwLDE0LjY3NCwxLjQ3MywxOC4xNiwzLjYyOWMtMC4wMDUtMC4xODktMC4wMTgtMC4zNzMtMC4wMTgtMC41NjJjMC0wLjY4MiwwLjA0NS0xLjM1MiwwLjExNy0yLjAxMiAgICAgICBjLTAuMDctMC42NS0wLjExNy0xLjMwOS0wLjExNy0xLjk3N2MwLTIuMTU4LDAuMzc5LTQuMjI5LDEuMDU2LTYuMThDNTAuMTE3LDEyLjYwOSw0NC40NjEsMTAuMjQ2LDM4LjE5MywxMC4yNDZ6IiBmaWxsPSIjQkMyQTU0Ii8+PC9nPjxnPjxwYXRoIGQ9Ik0yMS43MTEsMjUuMTM3YzMuNTg0LTEuMDE0LDguMjA1LTEuNjI5LDEzLjI3Ny0xLjYyOWM3Ljg1NSwwLDE0LjY3NCwxLjQ3MywxOC4xNiwzLjYyOSAgICAgICBjLTAuMDA1LTAuMTg5LTAuMDE4LTAuMzczLTAuMDE4LTAuNTYyYzAtMC42ODIsMC4wNDUtMS4zNTIsMC4xMTctMi4wMTJjLTAuMDI4LTAuMjU2LTAuMDQ5LTAuNTE0LTAuMDY4LTAuNzcxICAgICAgIGMtMy45NzMtMy4yNzktOS4yMTktNS4yODctMTQuOTg2LTUuMjg3QzMxLjY3LDE4LjUwNCwyNS44MTEsMjEuMDY0LDIxLjcxMSwyNS4xMzd6IiBmaWxsPSIjQUExRjREIi8+PC9nPjxnPjxwYXRoIGQ9Ik01NC42NTksMTYuMTg2YzAsMi42MzMsMi4xNDIsNC43NzMsNC43OCw0Ljc3M2MyLjYzOCwwLDQuNzc1LTIuMTQxLDQuNzc1LTQuNzczICAgICAgIGMwLTIuNjQzLTIuMTM4LTQuNzg1LTQuNzc1LTQuNzg1QzU2LjgwMSwxMS40LDU0LjY1OSwxMy41NDMsNTQuNjU5LDE2LjE4NnoiIGZpbGw9IiNGN0Y1REMiLz48L2c+PGc+PHBhdGggZD0iTTU1LjQ1OSwxMy41MzVjLTAuNTA0LDAuNzYtMC44LDEuNjY4LTAuOCwyLjY1YzAsMS4zOTUsMC42MDQsMi42NDYsMS41NjEsMy41MjEgICAgICAgYzAuNTA1LTAuNzU4LDAuOC0xLjY2NiwwLjgtMi42NDNDNTcuMDIsMTUuNjY0LDU2LjQxNiwxNC40MSw1NS40NTksMTMuNTM1eiIgZmlsbD0iI0VBRThDMyIvPjwvZz48L2c+PGc+PGc+PGc+PHBhdGggZD0iTTU1LjYyMywzNy44NTVjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzVjMC0yLjkwMi04LjE2Ny02LjEzNy0xOS44ODUtNi4xMzcgICAgICAgIGMtMTEuNzIxLDAtMTkuODg5LDMuMjM0LTE5Ljg4OSw2LjEzN2MwLDAuNDE0LTAuMzM2LDAuNzUtMC43NSwwLjc1cy0wLjc1LTAuMzM2LTAuNzUtMC43NWMwLTMuNzAyLDcuNDk2LTcuNjM3LDIxLjM4OS03LjYzNyAgICAgICAgYzEzLjg5LDAsMjEuMzg1LDMuOTM1LDIxLjM4NSw3LjYzN0M1Ni4zNzMsMzcuNTIsNTYuMDM3LDM3Ljg1NSw1NS42MjMsMzcuODU1eiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0iTTU1LjYyMywzNy44NTVjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzVjMC0yLjkwMi04LjE2Ny02LjEzNy0xOS44ODUtNi4xMzcgICAgICAgIGMtMTEuNzIxLDAtMTkuODg5LDMuMjM0LTE5Ljg4OSw2LjEzN2MwLDAuNDE0LTAuMzM2LDAuNzUtMC43NSwwLjc1cy0wLjc1LTAuMzM2LTAuNzUtMC43NWMwLTMuNzAyLDcuNDk2LTcuNjM3LDIxLjM4OS03LjYzNyAgICAgICAgYzEzLjg5LDAsMjEuMzg1LDMuOTM1LDIxLjM4NSw3LjYzN0M1Ni4zNzMsMzcuNTIsNTYuMDM3LDM3Ljg1NSw1NS42MjMsMzcuODU1eiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48L2c+PGc+PHBhdGggZD0iTTU1LjYyMywzNy42NzJjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzV2LTYuNTI1YzAtMi45MDMtOC4xNjctNi4xMzktMTkuODg1LTYuMTM5ICAgICAgIGMtMTEuNzIxLDAtMTkuODg5LDMuMjM1LTE5Ljg4OSw2LjEzOXY2LjUyNWMwLDAuNDE0LTAuMzM2LDAuNzUtMC43NSwwLjc1cy0wLjc1LTAuMzM2LTAuNzUtMC43NXYtNi41MjUgICAgICAgYzAtMy43MDMsNy40OTYtNy42MzksMjEuMzg5LTcuNjM5YzEzLjg5LDAsMjEuMzg1LDMuOTM2LDIxLjM4NSw3LjYzOXY2LjUyNUM1Ni4zNzMsMzcuMzM2LDU2LjAzNywzNy42NzIsNTUuNjIzLDM3LjY3MnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PGc+PHBhdGggZD0iTTE1LjgxMSwyOC42MTVjLTAuMTAyLDAtMC4yMDMtMC4wMjEtMC4yOTktMC4wNjJjLTAuMjYxLTAuMTE0LTAuNDM2LTAuMzY1LTAuNDUtMC42NWwtMC4wMjItMC4zNSAgICAgICAgYy0wLjAxNy0wLjI0NS0wLjAzMy0wLjQ4OC0wLjAzMy0wLjcyOWMwLTExLjc1NSwxMC40MDItMjEuMzE4LDIzLjE4OC0yMS4zMThjNi44NTUsMCwxMy4zMjUsMi43NzQsMTcuNzUsNy42MTEgICAgICAgIGMwLjIxNCwwLjIzNCwwLjI1OCwwLjU3NiwwLjExLDAuODU2Yy0xLjQ0MiwyLjczMi0yLjE3Myw1LjYzLTIuMTczLDguNjEzYzAsMS41NTUsMC4yMDgsMy4xMTYsMC42MTgsNC42NDQgICAgICAgIGMwLjA1NywwLjEwNiwwLjA5LDAuMjI3LDAuMDksMC4zNTZjMCwwLjQxNy0wLjM2NiwwLjcyNS0wLjc2LDAuNzVjLTAuMTQ1LDAuMDA4LTAuMzIxLTAuMDQ3LTAuNDU3LTAuMTQ4ICAgICAgICBjLTMuMjE0LTIuMzg4LTEwLjQzLTMuOTMtMTguMzgzLTMuOTNjLTguMjA4LDAtMTUuNzIxLDEuNjgtMTguNjk1LDQuMTgyQzE2LjE1NiwyOC41NTUsMTUuOTg0LDI4LjYxNSwxNS44MTEsMjguNjE1eiAgICAgICAgIE0zOC4xOTMsNy4wMDZjLTExLjgyMywwLTIxLjQ2Niw4LjY4OS0yMS42ODQsMTkuNDQ3YzMuNzMzLTIuMjcxLDEwLjcyNi0zLjY5NSwxOC40NzktMy42OTUgICAgICAgIGM3LjE2NiwwLDEzLjgxMiwxLjI1LDE3LjcwMiwzLjI1OWMtMC4yMDYtMS4xMzctMC4zMS0yLjI4Ni0wLjMxLTMuNDMxYzAtMy4wNTUsMC43MDctNi4wMjUsMi4xMDItOC44MzUgICAgICAgIEM1MC4zNTMsOS40NTgsNDQuNDQ4LDcuMDA2LDM4LjE5Myw3LjAwNnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PC9nPjxnPjxwYXRoIGQ9Ik01OS40MzksMjEuNzA5Yy0zLjA0OSwwLTUuNTMtMi40NzgtNS41My01LjUyM2MwLTMuMDUyLDIuNDgxLTUuNTM1LDUuNTMtNS41MzUgICAgICAgYzMuMDQ3LDAsNS41MjUsMi40ODMsNS41MjUsNS41MzVDNjQuOTY1LDE5LjIzMSw2Mi40ODYsMjEuNzA5LDU5LjQzOSwyMS43MDl6IE01OS40MzksMTIuMTVjLTIuMjIyLDAtNC4wMywxLjgxLTQuMDMsNC4wMzUgICAgICAgYzAsMi4yMTksMS44MDgsNC4wMjMsNC4wMyw0LjAyM2MyLjIyLDAsNC4wMjUtMS44MDUsNC4wMjUtNC4wMjNDNjMuNDY1LDEzLjk2LDYxLjY1OSwxMi4xNSw1OS40MzksMTIuMTV6IiBmaWxsPSIjMDkzMjYwIi8+PC9nPjwvZz48L2c+PGc+PGNpcmNsZSBjeD0iMjYuODYxIiBjeT0iMzYuNjkiIGZpbGw9IiMwOTMyNjAiIHI9IjEuMjkyIi8+PGNpcmNsZSBjeD0iNDMuMTExIiBjeT0iMzYuNjkiIGZpbGw9IiMwOTMyNjAiIHI9IjEuMjkyIi8+PC9nPjxnPjxwYXRoIGQ9Ik00MC40NDMsNDEuMzM2YzAsMS41MDgtMS4yMjEsMi43MjktMi43MjgsMi43MjloLTUuNDU4Yy0xLjUwOCwwLTIuNzI5LTEuMjIxLTIuNzI5LTIuNzI5bDAsMCAgICAgYzAtMS41MDgsMS4yMjEtMi43MjksMi43MjktMi43MjloNS40NThDMzkuMjIzLDM4LjYwNyw0MC40NDMsMzkuODI4LDQwLjQ0Myw0MS4zMzZMNDAuNDQzLDQxLjMzNnoiIGZpbGw9IiNGQ0U1RTAiLz48L2c+PGc+PHBhdGggZD0iTTM3LjcxNiwzOC42MDdoLTUuNDU4Yy0xLjAwOCwwLTEuODc4LDAuNTUxLTIuMzUxLDEuMzYzYzAuNDczLDAuODEyLDEuMzQzLDEuMzY1LDIuMzUxLDEuMzY1aDUuNDU4ICAgICBjMS4wMDcsMCwxLjg3Ny0wLjU1MywyLjM1LTEuMzY1QzM5LjU5MywzOS4xNTgsMzguNzIzLDM4LjYwNywzNy43MTYsMzguNjA3eiIgZmlsbD0iI0ZGRjZGNSIvPjwvZz48Zz48cGF0aCBkPSJNMzcuNzE2LDQ0LjgxNGgtNS40NThjLTEuOTE4LDAtMy40NzktMS41NjEtMy40NzktMy40NzlzMS41NjEtMy40NzksMy40NzktMy40NzloNS40NTggICAgIGMxLjkxNywwLDMuNDc4LDEuNTYxLDMuNDc4LDMuNDc5UzM5LjYzMyw0NC44MTQsMzcuNzE2LDQ0LjgxNHogTTMyLjI1OCwzOS4zNTdjLTEuMDkxLDAtMS45NzksMC44ODgtMS45NzksMS45NzkgICAgIHMwLjg4OCwxLjk3OSwxLjk3OSwxLjk3OWg1LjQ1OGMxLjA5LDAsMS45NzgtMC44ODgsMS45NzgtMS45NzlzLTAuODg3LTEuOTc5LTEuOTc4LTEuOTc5SDMyLjI1OHoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTI3LjgyLDQ2LjkxdjQuMjIxYzAsMS43NTgsMS40MjYsMy4xODQsMy4xODYsMy4xODRoNy45NjFjMS43NiwwLDMuMTg2LTEuNDI2LDMuMTg2LTMuMTg0VjQ2LjkxSDI3LjgyeiIgZmlsbD0iI0JDMkE1NCIvPjwvZz48Zz48cmVjdCBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjMuMDYyIiB3aWR0aD0iMTQuMjc3IiB4PSIyNy44NDgiIHk9IjQ3LjE4OSIvPjwvZz48Zz48cGF0aCBkPSJNNDIuMTI1LDUxLjAwMkgyNy44NDhjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzVWNDYuOTFjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NWgxNC4yNzcgICAgIGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1djMuMzQyQzQyLjg3NSw1MC42NjYsNDIuNTM5LDUxLjAwMiw0Mi4xMjUsNTEuMDAyeiBNMjguNTk4LDQ5LjUwMmgxMi43NzdWNDcuNjZIMjguNTk4VjQ5LjUwMnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTM4Ljk2Nyw1NS4wNjRoLTcuOTYxYy0yLjE3LDAtMy45MzYtMS43NjUtMy45MzYtMy45MzRWNDYuOTFjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NWgxNC4zMzIgICAgIGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1djQuMjIxQzQyLjkwMiw1My4zLDQxLjEzNyw1NS4wNjQsMzguOTY3LDU1LjA2NHogTTI4LjU3LDQ3LjY2djMuNDcxICAgICBjMCwxLjM0MiwxLjA5MywyLjQzNCwyLjQzNiwyLjQzNGg3Ljk2MWMxLjM0MywwLDIuNDM2LTEuMDkyLDIuNDM2LTIuNDM0VjQ3LjY2SDI4LjU3eiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48L2c+PC9nPjwvc3ZnPg==')";
  // i.onmouseout = function(){i.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDc1IDc1IiBoZWlnaHQ9Ijc1cHgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1IDc1IiB3aWR0aD0iNzVweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGcgaWQ9IkxheWVyXzEiPjxnPjxnPjxnPjxnPjxwYXRoIGQ9Ik01OS4xODgsNDUuMDFjMCwyLjAzMS0xLjY0OCwzLjY4LTMuNjgxLDMuNjhsMCwwYy0yLjAzMywwLTMuNjgxLTEuNjQ4LTMuNjgxLTMuNjh2LTQuNDA2ICAgICAgIGMwLTIuMDMzLDEuNjQ3LTMuNjgyLDMuNjgxLTMuNjgybDAsMGMyLjAzMiwwLDMuNjgxLDEuNjQ4LDMuNjgxLDMuNjgyVjQ1LjAxeiIgZmlsbD0iI0YyRDFDOSIvPjwvZz48Zz48cGF0aCBkPSJNNTUuNTA3LDQ5LjQzOWMtMi40NDMsMC00LjQzMS0xLjk4Ny00LjQzMS00LjQzdi00LjQwNmMwLTIuNDQ0LDEuOTg4LTQuNDMyLDQuNDMxLTQuNDMyICAgICAgIHM0LjQzMSwxLjk4OCw0LjQzMSw0LjQzMnY0LjQwNkM1OS45MzgsNDcuNDUyLDU3Ljk1LDQ5LjQzOSw1NS41MDcsNDkuNDM5eiBNNTUuNTA3LDM3LjY3MmMtMS42MTYsMC0yLjkzMSwxLjMxNS0yLjkzMSwyLjkzMiAgICAgICB2NC40MDZjMCwxLjYxNSwxLjMxNCwyLjkzLDIuOTMxLDIuOTNzMi45MzEtMS4zMTQsMi45MzEtMi45M3YtNC40MDZDNTguNDM4LDM4Ljk4Nyw1Ny4xMjMsMzcuNjcyLDU1LjUwNywzNy42NzJ6IiBmaWxsPSIjMDkzMjYwIi8+PC9nPjwvZz48Zz48Zz48cGF0aCBkPSJNMTguMTQ2LDQ1LjAxYzAsMi4wMzEtMS42NDcsMy42OC0zLjY4LDMuNjhsMCwwYy0yLjAzMywwLTMuNjgyLTEuNjQ4LTMuNjgyLTMuNjh2LTQuNDA2ICAgICAgIGMwLTIuMDMzLDEuNjQ4LTMuNjgyLDMuNjgyLTMuNjgybDAsMGMyLjAzMiwwLDMuNjgsMS42NDgsMy42OCwzLjY4MlY0NS4wMXoiIGZpbGw9IiNGMkQxQzkiLz48L2c+PGc+PHBhdGggZD0iTTE0LjQ2Nyw0OS40MzljLTIuNDQ0LDAtNC40MzItMS45ODctNC40MzItNC40M3YtNC40MDZjMC0yLjQ0NCwxLjk4OC00LjQzMiw0LjQzMi00LjQzMiAgICAgICBjMi40NDIsMCw0LjQzLDEuOTg4LDQuNDMsNC40MzJ2NC40MDZDMTguODk2LDQ3LjQ1MiwxNi45MDksNDkuNDM5LDE0LjQ2Nyw0OS40Mzl6IE0xNC40NjcsMzcuNjcyICAgICAgIGMtMS42MTcsMC0yLjkzMiwxLjMxNS0yLjkzMiwyLjkzMnY0LjQwNmMwLDEuNjE1LDEuMzE1LDIuOTMsMi45MzIsMi45M2MxLjYxNSwwLDIuOTMtMS4zMTQsMi45My0yLjkzdi00LjQwNiAgICAgICBDMTcuMzk2LDM4Ljk4NywxNi4wODIsMzcuNjcyLDE0LjQ2NywzNy42NzJ6IiBmaWxsPSIjMDkzMjYwIi8+PC9nPjwvZz48L2c+PGc+PHBhdGggZD0iTTE0LjI2MiwzMC4yMTVWNTAuNTFjMCwxMC4wNjgsOC4xNjUsMTguMjM0LDE4LjIzNSwxOC4yMzRoNC45NzljMTAuMDcsMCwxOC4yMzUtOC4xNjYsMTguMjM1LTE4LjIzNCAgICAgVjMwLjIxNUgxNC4yNjJ6IiBmaWxsPSIjRjBGQUZGIi8+PC9nPjxnPjxwYXRoIGQ9Ik0xNC4yNjIsNDUuMzY5YzAsMTAuMDcsOC4xNjUsMTguMjM2LDE4LjIzNSwxOC4yMzZoNC45NzljMTAuMDcsMCwxOC4yMzUtOC4xNjYsMTguMjM1LTE4LjIzNlYzMC4yMTUgICAgIEgxNC4yNjJWNDUuMzY5eiIgZmlsbD0iI0Q5RjFGRiIvPjwvZz48Zz48cGF0aCBkPSJNMzQuOTg4LDI4Ljc5N2MtMTEuMzk4LDAtMjAuNjM5LDMuMDg2LTIwLjYzOSw2Ljg4OXY0LjUwOGMwLTMuODAzLDkuMjQtNi44ODksMjAuNjM5LTYuODg5ICAgICBjMTEuMzk2LDAsMjAuNjM1LDMuMDg2LDIwLjYzNSw2Ljg4OXYtNC41MDhDNTUuNjIzLDMxLjg4Myw0Ni4zODQsMjguNzk3LDM0Ljk4OCwyOC43OTd6IiBmaWxsPSIjQUVEQ0ZGIi8+PC9nPjxnPjxwYXRoIGQ9Ik0zOC44OTQsNDIuMjgzSDMxLjA4Yy0xLjE2OCwwLTIuMjY3LDAuMjkxLTMuMjMyLDAuNzk5YzAuMTQsMS44NTQsMS42NjksMy4zMTYsMy41NTcsMy4zMTZoNy4xNjYgICAgIGMxLjg4NiwwLDMuNDE2LTEuNDYzLDMuNTU1LTMuMzE2QzQxLjE1OSw0Mi41NzQsNDAuMDYxLDQyLjI4MywzOC44OTQsNDIuMjgzeiIgZmlsbD0iI0FFRENGRiIvPjwvZz48Zz48cGF0aCBkPSJNMTkuODA5LDMwLjIxNXYxNC44NjNjMCwzLjg4NywxLjY3NCw3LjM3Nyw0LjMyNSw5LjgxNnYtNS42NjZjMC0zLjgzNiwzLjEwOS02Ljk0NSw2Ljk0Ni02Ljk0NWg3LjgxMyAgICAgYzMuODM1LDAsNi45NDYsMy4xMDksNi45NDYsNi45NDV2NS42NjZjMi42NTEtMi40NDEsNC4zMjQtNS45Myw0LjMyNC05LjgxNlYzMC4yMTVIMTkuODA5eiIgZmlsbD0iI0YyRDFDOSIvPjwvZz48Zz48cGF0aCBkPSJNMTkuODA5LDMxLjAyOXY0LjUwOGMzLjc3Mi0xLjM2OSw5LjE2Ny0yLjIzMiwxNS4xOC0yLjIzMmM2LjAxLDAsMTEuNDA0LDAuODYzLDE1LjE3NiwyLjIzMnYtNC41MDggICAgIGMtMC44MTgtMC4yOTctMS43MS0wLjU2OC0yLjY3MS0wLjgxNEgyMi40OEMyMS41MiwzMC40NjEsMjAuNjI3LDMwLjczMiwxOS44MDksMzEuMDI5eiIgZmlsbD0iI0U4QjZBQyIvPjwvZz48Zz48cGF0aCBkPSJNNDUuODQsNTUuNjQ1Yy0wLjEwMiwwLTAuMjA1LTAuMDIxLTAuMzAxLTAuMDYzYy0wLjI3Mi0wLjEyLTAuNDQ5LTAuMzg5LTAuNDQ5LTAuNjg3di01LjY2NiAgICAgYzAtMy40MTYtMi43OC02LjE5NS02LjE5Ni02LjE5NUgzMS4wOGMtMy40MTcsMC02LjE5NiwyLjc3OS02LjE5Niw2LjE5NXY1LjY2NmMwLDAuMjk4LTAuMTc2LDAuNTY3LTAuNDQ5LDAuNjg3ICAgICBjLTAuMjcxLDAuMTE5LTAuNTksMC4wNjctMC44MDktMC4xMzVjLTIuOTAzLTIuNjctNC41NjctNi40NS00LjU2Ny0xMC4zNjhWMzAuMjE1YzAtMC40MTQsMC4zMzYtMC43NSwwLjc1LTAuNzVoMzAuMzU1ICAgICBjMC40MTQsMCwwLjc1LDAuMzM2LDAuNzUsMC43NXYxNC44NjNjMCwzLjkxNy0xLjY2NSw3LjY5Ni00LjU2NiwxMC4zNjhDNDYuMjA3LDU1LjU3Niw0Ni4wMjQsNTUuNjQ1LDQ1Ljg0LDU1LjY0NXogICAgICBNMjAuNTU5LDMwLjk2NXYxNC4xMTNjMCwyLjg4OCwxLjAxMyw1LjY5MiwyLjgyNSw3LjkyNnYtMy43NzVjMC00LjI0MywzLjQ1My03LjY5NSw3LjY5Ni03LjY5NWg3LjgxMyAgICAgYzQuMjQ0LDAsNy42OTYsMy40NTIsNy42OTYsNy42OTV2My43NzRjMS44MTItMi4yMzQsMi44MjQtNS4wMzgsMi44MjQtNy45MjVWMzAuOTY1SDIwLjU1OXoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTQ1Ljg0LDU5LjgxMmMtMC40MTQsMC0wLjc1LTAuMzM2LTAuNzUtMC43NXYtNS42NjhjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NXMwLjc1LDAuMzM2LDAuNzUsMC43NSAgICAgdjUuNjY4QzQ2LjU5LDU5LjQ3Nyw0Ni4yNTQsNTkuODEyLDQ1Ljg0LDU5LjgxMnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTI0LjEzNCw1OS44MTJjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzV2LTUuNjY4YzAtMC40MTQsMC4zMzYtMC43NSwwLjc1LTAuNzVzMC43NSwwLjMzNiwwLjc1LDAuNzUgICAgIHY1LjY2OEMyNC44ODQsNTkuNDc3LDI0LjU0OCw1OS44MTIsMjQuMTM0LDU5LjgxMnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTM3LjQ3Niw2OS40OTRoLTQuOTc5Yy0xMC40NjksMC0xOC45ODUtOC41MTctMTguOTg1LTE4Ljk4NFYzMC4yMTVjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NWg0MS40NDkgICAgIGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1VjUwLjUxQzU2LjQ2MSw2MC45NzgsNDcuOTQ0LDY5LjQ5NCwzNy40NzYsNjkuNDk0eiBNMTUuMDEyLDMwLjk2NVY1MC41MSAgICAgYzAsOS42NDEsNy44NDQsMTcuNDg0LDE3LjQ4NSwxNy40ODRoNC45NzljOS42NDIsMCwxNy40ODUtNy44NDMsMTcuNDg1LTE3LjQ4NFYzMC45NjVIMTUuMDEyeiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48Zz48Zz48Zz48cGF0aCBkPSJNMzQuOTg4LDIzLjUwOGMtMTEuMzk4LDAtMjAuNjM5LDMuMDg2LTIwLjYzOSw2Ljg4OXY2LjUyNWgwLjAyN2MwLjI5My0zLjcxOSw5LjM5Ni02LjcwNywyMC42MTEtNi43MDcgICAgICAgYzExLjIxMSwwLDIwLjMxNCwyLjk4OCwyMC42MDcsNi43MDdoMC4wMjd2LTYuNTI1QzU1LjYyMywyNi41OTQsNDYuMzg0LDIzLjUwOCwzNC45ODgsMjMuNTA4eiIgZmlsbD0iI0Y3RjVEQyIvPjwvZz48Zz48cGF0aCBkPSJNMzQuOTg4LDI1LjcwN2MtMTEuMzk4LDAtMjAuNjM5LDMuMDg2LTIwLjYzOSw2Ljg4OXY0LjUwOGMwLTMuODAzLDkuMjQtNi44ODksMjAuNjM5LTYuODg5ICAgICAgIGMxMS4zOTYsMCwyMC42MzUsMy4wODYsMjAuNjM1LDYuODg5di00LjUwOEM1NS42MjMsMjguNzkzLDQ2LjM4NCwyNS43MDcsMzQuOTg4LDI1LjcwN3oiIGZpbGw9IiNFQUU4QzMiLz48L2c+PGc+PGc+PHBhdGggZD0iTTM0Ljk4OCwyMy41MDhjOC4zOTIsMCwxNS42MDIsMS42OCwxOC44Myw0LjA3OGMtMC40NDUtMS42MDQtMC42ODgtMy4yNzEtMC42ODgtNSAgICAgICAgYzAtMy4yMTksMC44MjgtNi4yNSwyLjI2LTguOTYzYy00LjExNS00LjQ5OC0xMC4yODktNy4zNjctMTcuMTk3LTcuMzY3Yy0xMi4zOTUsMC0yMi40MzgsOS4yMDctMjIuNDM4LDIwLjU2OCAgICAgICAgYzAsMC4zNDQsMC4wMzcsMC42OTEsMC4wNTUsMS4wNDFDMTguODQ0LDI1LjMxNCwyNi4yNywyMy41MDgsMzQuOTg4LDIzLjUwOHoiIGZpbGw9IiNFODM4NjIiLz48L2c+PC9nPjxnPjxwYXRoIGQ9Ik0zOC4xOTMsMTAuMjQ2Yy0xMS4yNDYsMC0yMC41NTUsNy41NzYtMjIuMTg0LDE3LjQ2OWMzLjE0Mi0yLjQ3MSwxMC40MzQtNC4yMDcsMTguOTc5LTQuMjA3ICAgICAgIGM3Ljg1NSwwLDE0LjY3NCwxLjQ3MywxOC4xNiwzLjYyOWMtMC4wMDUtMC4xODktMC4wMTgtMC4zNzMtMC4wMTgtMC41NjJjMC0wLjY4MiwwLjA0NS0xLjM1MiwwLjExNy0yLjAxMiAgICAgICBjLTAuMDctMC42NS0wLjExNy0xLjMwOS0wLjExNy0xLjk3N2MwLTIuMTU4LDAuMzc5LTQuMjI5LDEuMDU2LTYuMThDNTAuMTE3LDEyLjYwOSw0NC40NjEsMTAuMjQ2LDM4LjE5MywxMC4yNDZ6IiBmaWxsPSIjQkMyQTU0Ii8+PC9nPjxnPjxwYXRoIGQ9Ik0yMS43MTEsMjUuMTM3YzMuNTg0LTEuMDE0LDguMjA1LTEuNjI5LDEzLjI3Ny0xLjYyOWM3Ljg1NSwwLDE0LjY3NCwxLjQ3MywxOC4xNiwzLjYyOSAgICAgICBjLTAuMDA1LTAuMTg5LTAuMDE4LTAuMzczLTAuMDE4LTAuNTYyYzAtMC42ODIsMC4wNDUtMS4zNTIsMC4xMTctMi4wMTJjLTAuMDI4LTAuMjU2LTAuMDQ5LTAuNTE0LTAuMDY4LTAuNzcxICAgICAgIGMtMy45NzMtMy4yNzktOS4yMTktNS4yODctMTQuOTg2LTUuMjg3QzMxLjY3LDE4LjUwNCwyNS44MTEsMjEuMDY0LDIxLjcxMSwyNS4xMzd6IiBmaWxsPSIjQUExRjREIi8+PC9nPjxnPjxwYXRoIGQ9Ik01NC42NTksMTYuMTg2YzAsMi42MzMsMi4xNDIsNC43NzMsNC43OCw0Ljc3M2MyLjYzOCwwLDQuNzc1LTIuMTQxLDQuNzc1LTQuNzczICAgICAgIGMwLTIuNjQzLTIuMTM4LTQuNzg1LTQuNzc1LTQuNzg1QzU2LjgwMSwxMS40LDU0LjY1OSwxMy41NDMsNTQuNjU5LDE2LjE4NnoiIGZpbGw9IiNGN0Y1REMiLz48L2c+PGc+PHBhdGggZD0iTTU1LjQ1OSwxMy41MzVjLTAuNTA0LDAuNzYtMC44LDEuNjY4LTAuOCwyLjY1YzAsMS4zOTUsMC42MDQsMi42NDYsMS41NjEsMy41MjEgICAgICAgYzAuNTA1LTAuNzU4LDAuOC0xLjY2NiwwLjgtMi42NDNDNTcuMDIsMTUuNjY0LDU2LjQxNiwxNC40MSw1NS40NTksMTMuNTM1eiIgZmlsbD0iI0VBRThDMyIvPjwvZz48L2c+PGc+PGc+PGc+PHBhdGggZD0iTTU1LjYyMywzNy44NTVjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzVjMC0yLjkwMi04LjE2Ny02LjEzNy0xOS44ODUtNi4xMzcgICAgICAgIGMtMTEuNzIxLDAtMTkuODg5LDMuMjM0LTE5Ljg4OSw2LjEzN2MwLDAuNDE0LTAuMzM2LDAuNzUtMC43NSwwLjc1cy0wLjc1LTAuMzM2LTAuNzUtMC43NWMwLTMuNzAyLDcuNDk2LTcuNjM3LDIxLjM4OS03LjYzNyAgICAgICAgYzEzLjg5LDAsMjEuMzg1LDMuOTM1LDIxLjM4NSw3LjYzN0M1Ni4zNzMsMzcuNTIsNTYuMDM3LDM3Ljg1NSw1NS42MjMsMzcuODU1eiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48L2c+PGc+PGc+PHBhdGggZD0iTTU1LjYyMywzNy44NTVjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzVjMC0yLjkwMi04LjE2Ny02LjEzNy0xOS44ODUtNi4xMzcgICAgICAgIGMtMTEuNzIxLDAtMTkuODg5LDMuMjM0LTE5Ljg4OSw2LjEzN2MwLDAuNDE0LTAuMzM2LDAuNzUtMC43NSwwLjc1cy0wLjc1LTAuMzM2LTAuNzUtMC43NWMwLTMuNzAyLDcuNDk2LTcuNjM3LDIxLjM4OS03LjYzNyAgICAgICAgYzEzLjg5LDAsMjEuMzg1LDMuOTM1LDIxLjM4NSw3LjYzN0M1Ni4zNzMsMzcuNTIsNTYuMDM3LDM3Ljg1NSw1NS42MjMsMzcuODU1eiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48L2c+PGc+PHBhdGggZD0iTTU1LjYyMywzNy42NzJjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzV2LTYuNTI1YzAtMi45MDMtOC4xNjctNi4xMzktMTkuODg1LTYuMTM5ICAgICAgIGMtMTEuNzIxLDAtMTkuODg5LDMuMjM1LTE5Ljg4OSw2LjEzOXY2LjUyNWMwLDAuNDE0LTAuMzM2LDAuNzUtMC43NSwwLjc1cy0wLjc1LTAuMzM2LTAuNzUtMC43NXYtNi41MjUgICAgICAgYzAtMy43MDMsNy40OTYtNy42MzksMjEuMzg5LTcuNjM5YzEzLjg5LDAsMjEuMzg1LDMuOTM2LDIxLjM4NSw3LjYzOXY2LjUyNUM1Ni4zNzMsMzcuMzM2LDU2LjAzNywzNy42NzIsNTUuNjIzLDM3LjY3MnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PGc+PHBhdGggZD0iTTE1LjgxMSwyOC42MTVjLTAuMTAyLDAtMC4yMDMtMC4wMjEtMC4yOTktMC4wNjJjLTAuMjYxLTAuMTE0LTAuNDM2LTAuMzY1LTAuNDUtMC42NWwtMC4wMjItMC4zNSAgICAgICAgYy0wLjAxNy0wLjI0NS0wLjAzMy0wLjQ4OC0wLjAzMy0wLjcyOWMwLTExLjc1NSwxMC40MDItMjEuMzE4LDIzLjE4OC0yMS4zMThjNi44NTUsMCwxMy4zMjUsMi43NzQsMTcuNzUsNy42MTEgICAgICAgIGMwLjIxNCwwLjIzNCwwLjI1OCwwLjU3NiwwLjExLDAuODU2Yy0xLjQ0MiwyLjczMi0yLjE3Myw1LjYzLTIuMTczLDguNjEzYzAsMS41NTUsMC4yMDgsMy4xMTYsMC42MTgsNC42NDQgICAgICAgIGMwLjA1NywwLjEwNiwwLjA5LDAuMjI3LDAuMDksMC4zNTZjMCwwLjQxNy0wLjM2NiwwLjcyNS0wLjc2LDAuNzVjLTAuMTQ1LDAuMDA4LTAuMzIxLTAuMDQ3LTAuNDU3LTAuMTQ4ICAgICAgICBjLTMuMjE0LTIuMzg4LTEwLjQzLTMuOTMtMTguMzgzLTMuOTNjLTguMjA4LDAtMTUuNzIxLDEuNjgtMTguNjk1LDQuMTgyQzE2LjE1NiwyOC41NTUsMTUuOTg0LDI4LjYxNSwxNS44MTEsMjguNjE1eiAgICAgICAgIE0zOC4xOTMsNy4wMDZjLTExLjgyMywwLTIxLjQ2Niw4LjY4OS0yMS42ODQsMTkuNDQ3YzMuNzMzLTIuMjcxLDEwLjcyNi0zLjY5NSwxOC40NzktMy42OTUgICAgICAgIGM3LjE2NiwwLDEzLjgxMiwxLjI1LDE3LjcwMiwzLjI1OWMtMC4yMDYtMS4xMzctMC4zMS0yLjI4Ni0wLjMxLTMuNDMxYzAtMy4wNTUsMC43MDctNi4wMjUsMi4xMDItOC44MzUgICAgICAgIEM1MC4zNTMsOS40NTgsNDQuNDQ4LDcuMDA2LDM4LjE5Myw3LjAwNnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PC9nPjxnPjxwYXRoIGQ9Ik01OS40MzksMjEuNzA5Yy0zLjA0OSwwLTUuNTMtMi40NzgtNS41My01LjUyM2MwLTMuMDUyLDIuNDgxLTUuNTM1LDUuNTMtNS41MzUgICAgICAgYzMuMDQ3LDAsNS41MjUsMi40ODMsNS41MjUsNS41MzVDNjQuOTY1LDE5LjIzMSw2Mi40ODYsMjEuNzA5LDU5LjQzOSwyMS43MDl6IE01OS40MzksMTIuMTVjLTIuMjIyLDAtNC4wMywxLjgxLTQuMDMsNC4wMzUgICAgICAgYzAsMi4yMTksMS44MDgsNC4wMjMsNC4wMyw0LjAyM2MyLjIyLDAsNC4wMjUtMS44MDUsNC4wMjUtNC4wMjNDNjMuNDY1LDEzLjk2LDYxLjY1OSwxMi4xNSw1OS40MzksMTIuMTV6IiBmaWxsPSIjMDkzMjYwIi8+PC9nPjwvZz48L2c+PGc+PGNpcmNsZSBjeD0iMjYuODYxIiBjeT0iMzYuNjkiIGZpbGw9IiMwOTMyNjAiIHI9IjEuMjkyIi8+PGNpcmNsZSBjeD0iNDMuMTExIiBjeT0iMzYuNjkiIGZpbGw9IiMwOTMyNjAiIHI9IjEuMjkyIi8+PC9nPjxnPjxwYXRoIGQ9Ik00MC40NDMsNDEuMzM2YzAsMS41MDgtMS4yMjEsMi43MjktMi43MjgsMi43MjloLTUuNDU4Yy0xLjUwOCwwLTIuNzI5LTEuMjIxLTIuNzI5LTIuNzI5bDAsMCAgICAgYzAtMS41MDgsMS4yMjEtMi43MjksMi43MjktMi43MjloNS40NThDMzkuMjIzLDM4LjYwNyw0MC40NDMsMzkuODI4LDQwLjQ0Myw0MS4zMzZMNDAuNDQzLDQxLjMzNnoiIGZpbGw9IiNGQ0U1RTAiLz48L2c+PGc+PHBhdGggZD0iTTM3LjcxNiwzOC42MDdoLTUuNDU4Yy0xLjAwOCwwLTEuODc4LDAuNTUxLTIuMzUxLDEuMzYzYzAuNDczLDAuODEyLDEuMzQzLDEuMzY1LDIuMzUxLDEuMzY1aDUuNDU4ICAgICBjMS4wMDcsMCwxLjg3Ny0wLjU1MywyLjM1LTEuMzY1QzM5LjU5MywzOS4xNTgsMzguNzIzLDM4LjYwNywzNy43MTYsMzguNjA3eiIgZmlsbD0iI0ZGRjZGNSIvPjwvZz48Zz48cGF0aCBkPSJNMzcuNzE2LDQ0LjgxNGgtNS40NThjLTEuOTE4LDAtMy40NzktMS41NjEtMy40NzktMy40NzlzMS41NjEtMy40NzksMy40NzktMy40NzloNS40NTggICAgIGMxLjkxNywwLDMuNDc4LDEuNTYxLDMuNDc4LDMuNDc5UzM5LjYzMyw0NC44MTQsMzcuNzE2LDQ0LjgxNHogTTMyLjI1OCwzOS4zNTdjLTEuMDkxLDAtMS45NzksMC44ODgtMS45NzksMS45NzkgICAgIHMwLjg4OCwxLjk3OSwxLjk3OSwxLjk3OWg1LjQ1OGMxLjA5LDAsMS45NzgtMC44ODgsMS45NzgtMS45NzlzLTAuODg3LTEuOTc5LTEuOTc4LTEuOTc5SDMyLjI1OHoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTI3LjgyLDQ2LjkxdjQuMjIxYzAsMS43NTgsMS40MjYsMy4xODQsMy4xODYsMy4xODRoNy45NjFjMS43NiwwLDMuMTg2LTEuNDI2LDMuMTg2LTMuMTg0VjQ2LjkxSDI3LjgyeiIgZmlsbD0iI0JDMkE1NCIvPjwvZz48Zz48cmVjdCBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjMuMDYyIiB3aWR0aD0iMTQuMjc3IiB4PSIyNy44NDgiIHk9IjQ3LjE4OSIvPjwvZz48Zz48cGF0aCBkPSJNNDIuMTI1LDUxLjAwMkgyNy44NDhjLTAuNDE0LDAtMC43NS0wLjMzNi0wLjc1LTAuNzVWNDYuOTFjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NWgxNC4yNzcgICAgIGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1djMuMzQyQzQyLjg3NSw1MC42NjYsNDIuNTM5LDUxLjAwMiw0Mi4xMjUsNTEuMDAyeiBNMjguNTk4LDQ5LjUwMmgxMi43NzdWNDcuNjZIMjguNTk4VjQ5LjUwMnoiIGZpbGw9IiMwOTMyNjAiLz48L2c+PGc+PHBhdGggZD0iTTM4Ljk2Nyw1NS4wNjRoLTcuOTYxYy0yLjE3LDAtMy45MzYtMS43NjUtMy45MzYtMy45MzRWNDYuOTFjMC0wLjQxNCwwLjMzNi0wLjc1LDAuNzUtMC43NWgxNC4zMzIgICAgIGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1djQuMjIxQzQyLjkwMiw1My4zLDQxLjEzNyw1NS4wNjQsMzguOTY3LDU1LjA2NHogTTI4LjU3LDQ3LjY2djMuNDcxICAgICBjMCwxLjM0MiwxLjA5MywyLjQzNCwyLjQzNiwyLjQzNGg3Ljk2MWMxLjM0MywwLDIuNDM2LTEuMDkyLDIuNDM2LTIuNDM0VjQ3LjY2SDI4LjU3eiIgZmlsbD0iIzA5MzI2MCIvPjwvZz48L2c+PC9nPjwvc3ZnPg==')";
  // };
  var hintbox;
  var c = credentials.category;
  if(c!=null){
  // category entry
  if(categories[c][2]!=null){
   i.classList.add('locked');
   hintbox = '<div class="hintbox login"><div class="hintbox_head login"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">'+ credentials.category +'</div><div class="grid right"><i id="ic_arrow" class="material-icons">close</i></div></div><div class="hintbox_content login mp-hidden"><p>You used the password from category <strong>'+ credentials.category  +'</strong></p><div id="pwhint_stored"><i class="material-icons hastext">lock</i><span class="pwd-hidden"> ****** </span><span type="cat" cat="'+ credentials.category +'" class="showPW">show</span></div><input placeholder="Enter Masterpassword" type="password" id="inputMPW"><a class="btn-mp light" id="btnInputMPW">confirm</a><hr><a id="openManager">open manager</a></div></div>';
 }else{
   i.classList.add('unlocked');
   hintbox = '<div class="hintbox login"><div class="hintbox_head login"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">'+ credentials.category +'</div><div class="grid right"><i id="ic_arrow" class="material-icons">close</i></div></div><div class="hintbox_content login mp-hidden"><p>You used the password from category <strong>'+ credentials.category  +'</strong></p><div id="pwhint_notstored"><i class="material-icons hastext">lock_open</i> No password stored</div><hr><a id="openManager">open manager</a></div></div>';
 }
}else{
  // unique entry
  i.classList.add('locked');
  hintbox = '<div class="hintbox login unique"><div class="hintbox_head login"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">Unique Password</div><div class="grid right"><i id="ic_arrow" class="material-icons">close</i></div></div><div class="hintbox_content login mp-hidden"><p>You stored a unique password for this website</p><div id="pwhint_stored"><i class="material-icons hastext">lock</i><span class="pwd-hidden"> ****** </span><span type="unique" class="showPW">show</span></div><input placeholder="Enter Masterpassword" type="password" id="inputMPW"><a class="btn-mp light" id="btnInputMPW">confirm</a><hr><a id="openManager">open manager</a></div></div>';

}

if($('#hbpwrm').length){ 

}else{
  var hintbox_div = document.createElement('div'); 
  var hintbox_w = document.createElement('div');
  hintbox_div.setAttribute('id', 'hbpwrm');
  hintbox_w.innerHTML = hintbox;
  hintbox_div.appendChild(hintbox_w);

  i.parentNode.insertBefore(hintbox_div, i.nextSibling);

  $('#hbpwrm .hintbox_head.login .left, #hbpwrm .hintbox_head.login .middle ').click(function(){
    $('.hintbox_head.login').toggleClass('focused');
    $('.hintbox_content.login').toggleClass('open');
    $('#ic_arrow').toggleClass('upsideDown');
  });

  $('#ic_arrow').click(function(){
    $('.hintbox.login').hide();
  });
  i.classList.add('mpinput');
  i.classList.add('login');
  $('input.mpinput.login').click(function(e){
    console.log("clicked");
    var parentOffset = $(this).offset(); 
    var relX = (e.pageX - parentOffset.left)/($(this).width());
     // console.log('relX: ' + relX +', relY: '+ relY);
     if(relX > 0.9){
      $('.hintbox.login').toggle();
      // $('input.mpinput').css( 'cursor', 'pointer' );
    }
  }); 

  $('.hintbox #openManager').click(function(){
    console.log("open manager");
    chrome.runtime.sendMessage({task: "open_manager"}, function (response) {
      console.log(response);
    });
  });


  $('.showPW').click(function(){
      //TODO: open manager page and show entry (pass url/category?)
      // alert("show pw");
      if($(this).html() != 'hide'){
        $('#pwhint_stored').hide();
        $('#inputMPW').show();
        $('#btnInputMPW').show();

        $('#btnInputMPW').on('click', function() {
          var val = $('#inputMPW').val();
          if (val.length > 0){
            var e = $('#inputMPW').attr('type');
            var mtype = $('.hintbox.login').hasClass('unique') ? 'unique' : 'cat';

            chrome.runtime.sendMessage(
              {task: "showPW", url: URL, entryType: mtype, hash: val, category : credentials.category}
              );
          }
        });
      }

    });

}
}

function showSignupHintbox(i){
  console.log("Function : showSignupHintbox");
  console.log(i);

  var hintbox = '<div class="hintbox signup"><div class="hintbox_head signup"><div class="grid left"><i class="material-icons"></i></div><div class="grid middle">Reusing a Password?</div><div class="grid right"><i id="ic_arrow" class="material-icons">close</i></div></div><div class="hintbox_content signup mp-hidden"><ul id="categoryList"></ul></div></div>';

  if($('#hbpwrms').length){ 

  }else{
    var hintbox_div = document.createElement('div'); 
    var hintbox_w = document.createElement('div');
    hintbox_div.setAttribute('id', 'hbpwrms');
    hintbox_w.innerHTML = hintbox;
    hintbox_div.appendChild(hintbox_w);
    
    i.parentNode.insertBefore(hintbox_div, i.nextSibling);

    $('.hintbox.signup').css({
      "min-width": i.offsetWidth+1+"px"
    });


    $('#ic_arrow').click(function(){
      $('.hintbox.signup').hide();
    });
    i.classList.add('mpinput');
    i.classList.add('signup');
    $('input.mpinput.signup').click(function(e){
     $('.hintbox.signup .grid.middle').html('Reusing a Password?');
     var parentOffset = $(this).offset(); 
     var relX = (e.pageX - parentOffset.left)/($(this).width());
     // console.log('relX: ' + relX +', relY: '+ relY);
     // if(relX > 0.9){
      // request create list (get categories from bg)
      chrome.runtime.sendMessage({task: "getCategories"}, function (response) {
        console.log(response);

      });
      // $('input.mpinput').css( 'cursor', 'pointer' );
    // }
  }); 

  }
}

function removeHintbox(){
  $('#hbpwrm').remove();
}

//submit button clicked. Check if there is an entry with this username for this website
function checkAccount(){
  console.log("Function : checkAccount");
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
      //TODO: "want to add this account?"

      chrome.runtime.sendMessage({task: "addHint", url: URL});
    }
  });
}


function handleError(error) {
  console.log('Error: '+ error);
}



chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse){
  console.log(request);
  if(request == "task_detect"){
    //start detector
    init();
  }else if(request.action == 'requestPW'){
    //  show pw
    $('#pwhint_stored').show();
    $('#inputMPW').hide();
    $('#btnInputMPW').hide();
    $('#inputMPW').val('');
    $('.showPW').html('hide');
    $('.pwd-hidden').html(request.content);
    $('.showPW').click(function(){
      $('.showPW').html('show');
      $('.pwd-hidden').html('*******');

    });
  }else if(request.action == 'fillList'){
    $('#categoryList').empty();
    var listItems = request.items["categories"];
    setupSignupHintbox(listItems);
  }else if(request.action == "fillPW"){
    console.log("answer from bg: " + request.content);
    var signupPW = $('.hintbox.signup').parent().parent().parent().find('input');
    signupPW.attr('placeholder', ' ');
    signupPW.attr('aria-label', ' '); 
    signupPW.val(request.content);
  }
}
function setupSignupHintbox(listItems){
    console.log(listItems);
    $('.hintbox.signup').toggle();
    $('.hintbox_head.signup').toggleClass('focused');
    $('.hintbox_content.signup').toggleClass('open');
    $('#ic_arrow').toggleClass('upsideDown');
    for(key in listItems){
      var lock = (listItems[key][2] == null) ? 'lock_open' : 'lock';

      $('#categoryList').append('<li id="'+ key +'" hash="'+ listItems[key][2] +'"><i class="material-icons">'+ listItems[key][1] +'</i><span>'+ key.replace('_', ' ') +'</span><i class="lock material-icons">'+ lock +'</i></li>')
    }
    $('#categoryList > li').on('click', function(){
      var chosen = $(this).attr('id'); 
      var hash = $(this).attr('hash');
      // autofill PW
      if(hash!=null && hash != 'undefined'){  
        chrome.runtime.sendMessage({task : 'decrypt', content: hash});
      }
      // collapse hintbox
      $('.hintbox_head.signup').toggleClass('focused');
      $('.hintbox_content.signup').toggleClass('open');
      $('#ic_arrow').toggleClass('upsideDown');
      // change hintbox_head
      var icon = $(this).find('.material-icons').html();
      $('.hintbox_head.signup .grid.left .material-icons').html(icon);
      $('.hintbox.signup .grid.middle').html(chosen.replace('_', ' '));
    });
}

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