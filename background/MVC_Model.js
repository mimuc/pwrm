define(["jquery","psl","scripts/tools/tools","scripts/cryptojs/rollups/aes","MVC_Controller_Managerpage","scripts/tools/crypt", "scripts/tools/storageloader"], 
	function($,psl,tools,aes,MVC_Controller_Managerpage,crypt, SL) {
	var exports = {};
	
	var initialize = exports.initialize = function() {
		console.log("Model : initialize");
		//create distinct categories elements depending on existing entries
		SL.getCategories(function(results){
			var categories = results["categories"];
			if(categories == null || categories.length == 0){
				var cat = {"categories" : {
					Banking : ["Info", "folder"],
					Email : ["Info", "email"]
					
				}};
				var setting = browser.storage.local.set(cat);
				setting.then(function(){
					MVC_Controller_Managerpage.fillDropdown(cat.categories);
					MVC_Controller_Managerpage.displayCategories(cat.categories, true); //calls loadEntries on callback
				});	

			}else{
			//display options in dropdown #categoryDropdown
			MVC_Controller_Managerpage.fillDropdown(categories);
			MVC_Controller_Managerpage.displayCategories(categories, true); //calls loadEntries on callback
			}
		});
	};
	var loadEntries = exports.loadEntries = function(categoryName, showOnlyUnique){
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var res = results["entries"];
				//create empty entries-storage if empty
				//TODO
				if(res == null){
					storingEntry = browser.storage.local.set({"entries" : {}});
				}

				if(showOnlyUnique){
					$('#uniqueEntryContainer').empty();
				}
				for(key in res){	
					if(showOnlyUnique){
						console.log("only display unique-pw entries");
						if(categoryName == null && res[key].category == null){
							MVC_Controller_Managerpage.displayEntry(key, res[key], false); //hasCategory==false
						}

					}else{
						if(res[key].category == categoryName){
							MVC_Controller_Managerpage.displayEntry(key,res[key], true);
						}
					}
				}
			});
	};
	var storeEntry = exports.storeEntry = function(mUrl, mCredential, toggleModal) {
			console.log("Model : storeEntry");	
			crypt.encrypt_aes(mCredential.password, function(data){	
				mCredential.password = data;
				console.log(mCredential);
				//first get current storage
				SL.getEntries(function(results){
					var entries = results;
					//check if there is an entry with the same url
					if(entries.entries != null && entries.entries[mUrl] != null){
						alert("You have already stored an entry for "+ mUrl +". It's assigned to category " + entries.entries[mUrl].category);
						
					}else{
						//push new entry
						entries.entries[mUrl] = mCredential;
						//store changes
						SL.setEntries(entries, function(){
							console.log("store success");
							//update display entries immediately that do not have a category
							//or if the chosen category is focused
							var focusedCategory = document.querySelector('.category-focused');
							if(focusedCategory!=null) var focusedCategoryName = focusedCategory.getAttribute('id').split('_')[1];
							if(mCredential.category == null ){
								MVC_Controller_Managerpage.displayEntry(mUrl, mCredential, false);
							}else if(focusedCategoryName != null && mCredential.category == focusedCategoryName){
								MVC_Controller_Managerpage.displayEntry(mUrl, mCredential, true);
							}
							MVC_Controller_Managerpage.displayNumberEntries();
							
						}, onError);
						//close modal
						if(toggleModal) $('#modal-newEntry').modal('toggle');
					}

			});		
			});
	};
	var addEntry = exports.addEntry = function() {
		console.log("Model : addEntry");
		/* initialise variables */
		//check radio buttons
		var useUniquePWD = false;
		var selectedRadio = document.querySelector('.radio-option:not(.hidden)');
		var selectedOption = selectedRadio.getAttribute("value");
		
		if(selectedOption == "option-category"){
			var inputCategoryDropdown = document.querySelectorAll('option:checked');
			var entryCategory = inputCategoryDropdown[0].value;
			
		}else{ //option-pwd
			var pwdHash = document.querySelector('#enterPWD').value;
			useUniquePWD = true;
		}
		
		var randID = tools.guidGenerator();
		var iurl = document.querySelector('.url');

		//extract location.origin from URL
		var pathArray = iurl.value.split( '/' );
		var protocol = pathArray[0];
		var host = pathArray[2];
		var entryURL = protocol + '//' + host;

		var inputUsername = document.querySelector('.username');
		/*
		var entryURL = inputURL.value;
		console.log(entryURL.substring(entryURL.length-1));
		if(entryURL.substring(entryURL.length-1)=='/'){
			entryURL = entryURL.slice(0, -1);
		}*/
		
		var entryUsername = inputUsername.value;

		var gettingItem = browser.storage.local.get(entryURL);
		gettingItem.then((result) => {
			var objTest = Object.keys(result);
			//dirty! 
			var mUrl;
			if(entryURL.indexOf('google')>0){
				mUrl = "https://accounts.google.com";
				console.log(entryURL.indexOf('google'));
			}
			else{
				mUrl = entryURL;
			}

			if(useUniquePWD){
				credential = {username: entryUsername, id: randID, password: pwdHash};
				this.storeEntry(mUrl, credential, true);
			}else{
				if(objTest.length < 1 && mUrl !== '' && entryUsername !== '') {
					mUrl.value = ''; entryUsername.value = ''; entryCategory.value ='';
					var credential;
					credential = {category: entryCategory, username: entryUsername, id: randID};
				}
				this.storeEntry(mUrl, credential, true);
			}
		}, onError);	
	};
	var quickAddEntry = exports.quickAddEntry = function(murl, musername, mcat, mpw) {
		console.log("Model : addEntry (quick)");
		/* initialise variables */
		//check radio buttons
		var useUniquePWD = (mpw != null);
		
		var entryCategory = mcat;			
		var randID = tools.guidGenerator();

		//extract location.origin from URL
		var pathArray = murl.split( '/' );
		var protocol = pathArray[0];
		var host = pathArray[2];
		var entryURL = protocol + '//' + host;

		var entryUsername = musername;

		var gettingItem = browser.storage.local.get(entryURL);
		gettingItem.then((result) => {
			var objTest = Object.keys(result);
			if(useUniquePWD){
				credential = {username: entryUsername, id: randID, password: mpw};
				this.storeEntry(entryURL, credential, false);
			}else{
				if(objTest.length < 1 && entryURL !== '' && entryUsername !== '') {
					entryURL.value = ''; entryUsername.value = ''; entryCategory.value ='';
					var credential;
					credential = {category: entryCategory, username: entryUsername, id: randID};
				}
				this.storeEntry(entryURL, credential, false);
			}
		}, onError);
	};

	//private functions
	var initCategories = function(){
			console.log("Model : initCategories");
			browser.storage.local.set({"categories" : {}});
	};
		
	return exports;
});