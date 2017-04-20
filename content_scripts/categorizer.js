//using webshrinker API (100 Request/Month..)
console.log("categorizer.js injected");

function getCategory(url){
var request = new XMLHttpRequest();
//base64 encoding
var url_enc = window.btoa(url);
var api_key = "Xtf5w8wFGjX1OCHcmVok&hash=66eb681f798372718a5e272a86d204b3";
var request_url = "https://api.webshrinker.com/categories/v2/"+url_enc+"?key="+api_key;

console.log(request_url);

request.open("GET",request_url);
request.setRequestHeader("X-Test","test1");
request.setRequestHeader("X-Test","test2");
request.addEventListener('load', function(event) {
   if (request.status >= 200 && request.status < 300) {
      console.log(request.responseText);
   } else {
      console.warn(request.statusText, request.responseText);
   }
});
//request.send();
}



getCategory("www.facebook.com");

