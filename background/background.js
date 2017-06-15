
require(['MVC_Controller_Managerpage', 'MVC_View_Managerpage', 'scripts/tools/showPW'],
	function(controller, view, showPW){

		var addBtn = document.querySelector('#addEntry');
		var addPWD = document.querySelector('#btnAddPWD');
		var addCategory = document.querySelector('#addCategory');
		var modalCategory = document.querySelector('#modalCategory');

		browser.runtime.onMessage.addListener(handleMessage);
		browser.tabs.onActivated.addListener(handleActivated);

		/* call init on page load */
		$(document).ready(function() {
			console.log("Browser used: " + navigator.userAgent);
			$('#section-categories').show();
			setup();
			addListeners();
		});


		/* old, not sure if still useful */

//searches for entries and displays results matching the typed letters
function searchAsync(value){
	console.log("searchAsync: " + value);
	showSection(null, '#section-searchresults');
	$('#section-searchresults h1').html("Results for: '" + value + "'");
	controller.search(value);
}

function showSection(clicked, section){
	var activeSection = $(section);
	$('.mp-section:not('+section+')').hide();
	activeSection.show();
	$('.sidebar-row').removeClass('active');
	if(clicked) clicked.addClass('active');
}

function addListeners(){
	$('#sidebar-categories').on('click', function(){showSection($(this), '#section-categories');});
	$('#sidebar-unique').on('click', function(){showSection($(this), '#section-unique');});
	$('#sidebar-modifications').on('click', function(){showSection($(this), '#section-modifications');});
	setupPWMeter();

	$(document).on('click', '.showPW', function(e){
		console.log(e.target.innerHTML);
		console.log("clicked on showPW");
			// e.stopImmediatePropagation();
			if(e.target.innerHTML == 'show'){
				
				showPW.trigger(($(this)));
				$('#modalMPW').on('shown.bs.modal', function (e) {
					$('#modalInputMPW').val('');
					$('#modalInputMPW').focus();
				});
				$('#modalMPW').modal('show');

			}else if(e.target.innerHTML == 'hide'){
				
				$(this).parent().parent().parent().find('.pwd-hidden').html('*******');
				$(this).html('show');
				
			// do nothing
		}
	});


	 // add event listeners to buttons and inputs
	 addPWD.addEventListener('click', showPWInput);
	 addBtn.addEventListener('click', function(){
	 	// trigger form validation
	 	var validate = $(this).parent().parent().find('form').validator('validate');
	 	// check if there are errors
	 	if($('#optionsRadios1').prop('checked')){
	 		if($(validate[0]).find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 		}else{
	 			controller.addEntry();
	 		}
	 	}else if($('#optionsRadios2').prop('checked')){
	 		if($(validate[0]).find('.glyphicon-remove').length > 0 ||
	 			$(validate[2]).find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 	}else{
	 		controller.addEntry();
	 	}
	 }

	});
	 addCategory.addEventListener('click', function(){
	 	// trigger form validation
	 	var validate = $(this).parent().parent().parent().find('form').validator('validate');
	 	// check if there are errors
	 	console.log(validate);

	 	if($('#enter-category-pwd').hasClass('hidden')){
	 		if($('#modalCategoryName').parent().find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 		}else{
	 			controller.createCategory();
	 		}
	 	}else{
	 		if($(validate[0]).find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 		}else{
	 			controller.createCategory();
	 		}

	 	}

	 });

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
		// TODO check if storing was successful and answer appropriately
		chrome.runtime.sendMessage({'msg': 'ok'},function(response){
		});
		require(['MVC_Controller_Managerpage'], function(controller){
			controller.quickAddEntry(message.url, message.username, message.cat, message.pw);
		});
		
	}else if(message.task == 'showPW'){
		// var msg = {action : "requestPW", content: "hallo"};
		// sendResponse(msg);

		controller.requestPassword(message.url, message.entryType, message.hash, message.category); //passing sendresponse not working
	}else if(message.task == 'addHint'){
		changeBrowserAction(false);
	}else if(message.task =="removeHint"){
		changeBrowserAction(true);
	}else if(message.task == "open_manager"){
		// TODO
		console.log("TODO: open manager");
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


function changeBrowserAction(add){
	console.log("Background : changeBrowserAction");
	console.log(add);
	var icon1 = chrome.extension.getURL("icons/icon-48.png");
	var icon2 = chrome.extension.getURL("icons/icon-48_add.png");

	if(add)
		chrome.browserAction.setIcon({path: icon1});
	else
		chrome.browserAction.setIcon({path: icon2});
}

function setupPWMeter(){
	var options = {};
	options.rules = {
		activated: {
			wordTwoCharacterClasses: true,
			wordRepetitions: true
		}
	};

	$('input[type="password"]:not(#modalInputMPW)').on('keyup', function(event) {
		if($(this).val().length > 0){
			$('.progress').show();
			$('.password-verdict').show();
		}else{
			$('.progress').hide();
			$('.password-verdict').hide();
		}
	});
	$('input[type="password"]').pwstrength(options);
	$('.progress').addClass("strength");
	$('.progress').hide();
}