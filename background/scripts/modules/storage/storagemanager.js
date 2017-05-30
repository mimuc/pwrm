/* storagemanager */
/* storage is logically split in "entries" and "categories" */
define(["jquery","psl","scripts/modules/tools/tools","scripts/modules/storage/sm_display", "scripts/modules/storage/sm_category"], function($,psl,tools, sm_display, sm_category) {
	return {
		initialize: function() {
			console.log("Function : initialize");

			//create distinct categories elements depending on existing entries
			//TODO
			//testing 
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {

				var categories = results["categories"];

				if(categories == null || categories.length == 0){
					var cat = {"categories" : {
						Banking : ["Info", "folder"],
						Email : ["Info", "email"]
						
					}};
					var setting = browser.storage.local.set(cat);
					setting.then(function(){
						sm_category.fillDropdown(cat.categories);
						sm_category.displayCategories(cat.categories, true); //calls loadEntries on callback
					});	

				}else{
				//display options in dropdown #categoryDropdown
				sm_category.fillDropdown(categories);
				sm_category.displayCategories(categories, true); //calls loadEntries on callback
			}
		});

			//in case there is no categoy yet, create empty object in storage
			function initCategories(){
				console.log("Function : initCategories");
				browser.storage.local.set({"categories" : {}});
			}

		},

		loadEntries: function(categoryName, showOnlyUnique){
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var res = results["entries"];
				//create empty entries-storage if empty
				//TODO
				if(res == null){
					storingEntry = browser.storage.local.set({"entries" : {}});
				}

				for(key in res){	
					if(showOnlyUnique){
						if(categoryName == null && res[key].category == null){
							sm_display.displayEntry(key, res[key], false); //hasCategory==false
						}

					}else{
						if(res[key].category == categoryName){
							sm_display.displayEntry(key,res[key], true);
						}
					}
				}
			});
		},

		storeEntry: function(mUrl, mCredential) {
			console.log("Function : storeEntry");
			//first get current storage
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var entries = results;
				//check if there is an entry with the same url
				if(entries.entries != null && entries.entries[mUrl] != null){
					alert("You have already stored an entry for "+ mUrl +". It's assigned to category " + entries.entries[mUrl].category);
					//TODO
				}else{
				//push new entry
				entries.entries[mUrl] = mCredential;
				//store changes
				var storingEntry = browser.storage.local.set(entries);
				storingEntry.then(() => {
					console.log("store success");
					//update display entries immediately that do not have a category
					//or if the chosen category is focused
					var focusedCategory = document.querySelector('.category-focused');
					if(focusedCategory!=null) var focusedCategoryName = focusedCategory.getAttribute('id').split('_')[1];
					if(mCredential.category == null ){
						sm_display.displayEntry(mUrl, mCredential, false);
					}else if(focusedCategoryName != null && mCredential.category == focusedCategoryName){
						sm_display.displayEntry(mUrl, mCredential, true);
					}
					sm_category.displayNumberEntries();
					
				}, onError);
				//close modal
				$('#modal-newEntry').modal('toggle');
			}

		});		
		},

		addEntry: function() {
			console.log("Function : addEntry");
			/* initialise variables */
			//check radio buttons
			var useUniquePWD = false;
			var selectedRadio = document.querySelector('.radio-option:not(.hidden)');
			var selectedOption = selectedRadio.getAttribute("value");
			
			if(selectedOption == "option-category"){
				var inputCategoryDropdown = document.querySelectorAll('option:checked');
				var entryCategory = inputCategoryDropdown[0].value;
				
			}else{ //option-pwd
				var password = 	document.querySelector('#enterPWD').value;
				useUniquePWD = true;
			}
			
			var randID = tools.guidGenerator();
			var inputURL = document.querySelector('.url');
			var inputUsername = document.querySelector('.username');
			
			var entryURL = inputURL.value;
			console.log(entryURL.substring(entryURL.length-1));
			if(entryURL.substring(entryURL.length-1)=='/'){
				entryURL = entryURL.slice(0, -1);
			}
			
			var entryUsername = inputUsername.value;

			var gettingItem = browser.storage.local.get(entryURL);
			gettingItem.then((result) => {
				var objTest = Object.keys(result);
				if(useUniquePWD){
					credential = {username: entryUsername, id: randID, password: password};
					this.storeEntry(entryURL, credential);
				}else{
					if(objTest.length < 1 && entryURL !== '' && entryUsername !== '') {
						entryURL.value = ''; entryUsername.value = ''; entryCategory.value ='';
						var credential;
						credential = {category: entryCategory, username: entryUsername, id: randID};
					}
					this.storeEntry(entryURL, credential);
				}
			}, onError);
			
			
		}

		
	}
});