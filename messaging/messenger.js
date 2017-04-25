//handles messaging between content scripts and background

function createJSON(inputArray){
   var obj = new Object();
   obj.title = inputArray[0];
   obj.url  = inputArray[1];
   //...
   return JSON.stringify(obj);
}

function sendBackground(jsonObject){
	console.log("sending message digga");
	chrome.runtime.sendMessage(jsonObject, function(response) {
	  console.log("MESSAGE SENT: " + response);
	});
}

