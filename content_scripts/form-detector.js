console.log("script injected");

var title = document.title;
var url = document.URL;

//check against type-attribute 
var attr_mail = "email";
var attr_pw = "password";
//if there is no match, check via regex to find inputs
var regex_name = /e-mail$|^email$|name(?!=)/;
var regex_pw = /pass/;



var inputs = document.getElementsByTagName('input');
for (index = 0; index < inputs.length; ++index) {
    // deal with inputs[index] element.
    var i = inputs[index];
  //console.log(inputs[index].outerHTML);
  if(i.getAttribute("type").toUpperCase() === attr_mail.toUpperCase() ||
    new RegExp(regex_name).test(i.outerHTML)){
      console.log("username input found -->");
      console.log(i);
  }
  if(i.getAttribute("type").toUpperCase() === attr_pw.toUpperCase() ||
    new RegExp(regex_pw).test(i.outerHTML)){
      console.log("password input found -->");
      console.log(i);
  }
}
//console.log(url);
