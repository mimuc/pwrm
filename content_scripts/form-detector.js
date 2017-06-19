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
var chosenIndex = 0;
var mCredentials, mCategories;

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
  setTimeout(function() { findForms(); }, 500);
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
  console.log("Function : findInput");
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
      showHintbox(i, credentials[chosenIndex], categories, categoryIcon);
    }else{
      showSignupHintbox(i);
    }
  }
}

}

function lookupStorage(form){
 var requestPromise = browser.storage.local.get();
 requestPromise.then(function(data){
  var cat = data.categories; mCategories = cat;
  var entries = data.entries;
  var foundEntry = null;
  var foundEntries = [];
  for(key in entries){
      // !! multiple possible
      if(entries[key].url == URL){
        foundEntry = entries[key];
        foundEntries.push(entries[key]);
      }
    }
    mCredentials = foundEntries;
    if(foundEntry != null){
      console.log(foundEntries);
      console.log("Found "+foundEntries.length+" entries for this URL in local storage.");
      console.log("first username is: " + foundEntries[chosenIndex].username);
      if(foundEntries[chosenIndex].category == null){
        //use unique icon
        findInput(form, foundEntries, cat, 'lock');
      }else{
        /* there is a matching URL / account in the storage */
        /* second parameter is the matching between entry.categoryName and categories --> icon */
        findInput(form, foundEntries, cat, cat[foundEntries[chosenIndex].category][1]);
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
  i.classList.add('highlightInput');
  var input = $('input.highlightInput');
  //autofill username 
  i.value = credentials[chosenIndex].username;
  i.html = credentials[chosenIndex].username;
  // create and populate dropdown if size > 1
  if(credentials[1]!=null){
    var datalist = document.createElement('datalist');
    datalist.setAttribute('id', 'datalist');
    i.setAttribute('list', 'datalist');
    for(key in credentials){
      var option = document.createElement('option');
      option.setAttribute('value', credentials[key].username);
      datalist.appendChild(option);
    }
    i.parentNode.insertBefore(datalist, i.nextSibling);
    // listen for selection in datalist and trigger update depending on chosen username
    input.bind('input.mpinput.login', function () {
      console.log("selected user: " + $(this).val());
      for(var i=0;i<credentials.length;i++){
        if(credentials[i].username == $(this).val()) chosenIndex = i;
      }
      update(input);
    });
  }
}

function update(input){
  console.log("Function : update");
  var activeCred = mCredentials[chosenIndex];
  console.log(activeCred);
  // if(activeCred.password || mCategories[activeCred.category][2]) input.removeClass('unlocked'); input.addClass('locked');
  // if(!activeCred.password) input.removeClass('locked'); input.addClass('unlocked');

  var pwInput = document.querySelector('#hbpwrm').parentNode.querySelector('input');
  showHintbox(pwInput, activeCred, mCategories, 'folder');
}


function showHintbox(i, credentials, categories, icon){
  console.log("Function : showHintbox");
  removeHintbox();
  var hintbox;  var c = credentials.category;
  if(c!=null){
  // category entry
  if(categories[c][2]!=null){
   i.classList.add('locked'); i.classList.remove('unlocked');
   hintbox = '<div class="hintbox login"><div class="hintbox_head login"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">'+ credentials.category.replace('_', ' ') +'</div><div class="grid right"><i id="ic_arrow" class="material-icons">close</i></div></div><div class="hintbox_content login mp-hidden"><p>You used the password from category <strong>'+ credentials.category.replace('_', ' ')  +'</strong></p><div id="pwhint_stored"><i class="material-icons hastext">lock</i><span class="pwd-hidden"> ****** </span><span type="cat" cat="'+ credentials.category.replace('_', ' ') +'" class="showPW">show</span></div><input placeholder="Enter Masterpassword" type="password" id="inputMPW"><a class="btn-mp light" id="btnInputMPW">confirm</a><hr><a id="openManager">open manager</a></div></div>';
 }else{
   i.classList.add('unlocked'); i.classList.remove('locked');
   hintbox = '<div class="hintbox login"><div class="hintbox_head login"><div class="grid left"><i class="material-icons">'+ icon +'</i></div><div class="grid middle">'+ credentials.category.replace('_', ' ') +'</div><div class="grid right"><i id="ic_arrow" class="material-icons">close</i></div></div><div class="hintbox_content login mp-hidden"><p>You used the password from category <strong>'+ credentials.category.replace('_', ' ')  +'</strong></p><div id="pwhint_notstored"><i class="material-icons hastext">lock_open</i> No password stored</div><hr><a id="openManager">open manager</a></div></div>';
 }
}else{
  // unique entry
  i.classList.add('locked'); i.classList.remove('unlocked');
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
   $('input.mpinput.login').unbind('click');
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