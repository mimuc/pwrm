
require(['MVC_Controller_Managerpage', 'MVC_View_Managerpage'],
	function(controller, view){

var addBtn = document.querySelector('#addEntry');
var addPWD = document.querySelector('#btnAddPWD');
var addCategory = document.querySelector('#addCategory');
var modalCategory = document.querySelector('#modalCategory');

browser.runtime.onMessage.addListener(handleMessage);
browser.tabs.onActivated.addListener(handleActivated);

/* call init on page load */
$(document).ready(function() {
	setup();
	addListeners();
});


/* old, not sure if still useful */

//searches for entries and displays results matching the typed letters
function searchAsync(value){
	console.log("searchAsync: " + value);
}

function addListeners(){
	 // add event listeners to buttons and inputs
	 addPWD.addEventListener('click', showPWInput);
	 addBtn.addEventListener('click', function(){controller.addEntry();});
	 addCategory.addEventListener('click', function(){controller.createCategory();});

	//  $(document).on('click', function(){
	 
	// });

	 $("#radio-form :input").change(function() {
	 	$('.option-pwd').toggleClass('hidden'); 
	 	$('.option-category').toggleClass('hidden'); 
	 });

	  //listen for searchfield input
	  $('#search').on('keyup', function() {
	  	if (this.value.length > 0) searchAsync(this.value);
	  });
}

function setup(){
	clearInputs(); 
	console.log("called setup");

 	//init storage logic
  	require(["MVC_Model"], function init(MVC_Model){
  		MVC_Model.initialize();
  	});

  	// reconfigure radiogroups
  	$('#optionsRadios1').prop('checked',true); 
}
//listen for tab changes to trigger form-detection (no reload needed)
function handleActivated(activeInfo) {
	console.log("Tab " + activeInfo.tabId +" was activated");
  	sendMessage("task_detect");
}
function sendMessage(msg) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, msg);
	});
}
function onError(e){
	
	console.log(e);
}
function clearInputs(){
	
	view.clearInputs();
}
//receives and answers messages from content_scripts [if needed]
function handleMessage(message, sender, sendResponse) {
	console.log(message);
	if(message.task == 'store'){
		console.log(message.url);
		require(['MVC_Controller_Managerpage'], function(controller){
			controller.quickAddEntry(message.url, message.username, message.cat, message.pw);
		});
		sendResponse("Saving entry");
	}else if(message.task == 'showPW'){
		requestPassword(message.url, message.entryType, message.hash, sendResponse);

	}
}
//programmatically preselect options in dropdown
function setSelectedIndex(select, index){
	select.options[index-1].selected = true;
	return;
}
function showPWInput(){
	
	view.showPWInput();
}
});