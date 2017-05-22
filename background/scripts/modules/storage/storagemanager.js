/* storagemanager */
/* storage is logically split in "entries" and "categories" */
define(["psl","scripts/modules/tools/tools","scripts/modules/storage/sm_display", "scripts/modules/storage/sm_category"], function(psl,tools, sm_display, sm_category) {
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
					browser.storage.local.set({"categories" : {
						Dings : ["Info","folder"],
						Email : ["Info", "folder"],
						Social_Media : ["Info", "folder"],
						Wichtig : ["Info", "folder"],
						Unwichtig : ["Info", "folder"]
					}});
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
						if(categoryName == null && res[key].category == null)
							sm_display.displayEntry(key, res[key], false); //hasCategory==false
					}else{
						if(res[key].category == categoryName){
							sm_display.displayEntry(key,res[key], true);
							console.log("ha");
						}
					}
					
					
					
				}
			}, onError);
		},

		storeEntry: function(mUrl, mCredential) {
			console.log("Function : storeEntry");
			//first get current storage
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var entries = results;
				//check if there is an entry with the same url
				if(entries.entries != null && entries.entries[mUrl] != null){
					alert("yo, there is an entry for "+ mUrl);
					//TODO
				}
				//push new entry
				entries.entries[mUrl] = mCredential;
				//store changes
				var storingEntry = browser.storage.local.set(entries);
				storingEntry.then(() => {
					console.log("store success");
					//update display entries immediately that do not have a category
					if(mCredential.category == null) sm_display.displayEntry(mUrl, mCredential, false);
					sm_category.displayNumberEntries();
				}, onError);

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