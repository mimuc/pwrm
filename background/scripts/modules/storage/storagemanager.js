/* storagemanager */
/* storage is logically split in "entries" and "categories" */
define(["scripts/modules/storage/sm_display", "scripts/modules/storage/sm_category"], function(sm_display, sm_category) {
	return {
		initialize: function() {
			console.log("Function : initialize");

			//create distinct categories elements depending on existing entries
			//TODO
			//testing
			browser.storage.local.set({"categories" : {
				Banking : ["I'm the banking category","euro_symbol"],
				Email : ["description", "email"],
				Unwichtig : ["ich bin unwichtig", "folder"]
			}});

			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {

				var categories = results["categories"];
				//display options in dropdown #categoryDropdown
				sm_category.fillDropdown(categories);
				sm_category.displayCategories(categories); //calls loadEntries on callback
			});

		},

		loadEntries: function(){
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var res = results["entries"];

				//create empty entries-storage if empty
				if(res == null){
					storingEntry = browser.storage.local.set({"entries" : {}});
				}

				for(key in res){
					// TODO 3x				
					sm_display.displayEntry(key,res[key]);
				}
			}, onError);
		},

		storeEntry: function(mUrl, mCredential) {
			console.log("Function : storeEntry");
			//first get current storage
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var entries = results;
				//push new entry
				entries.entries[mUrl] = mCredential;
				//store changes
				var storingEntry = browser.storage.local.set(entries);
				storingEntry.then(() => {
					console.log("store success");
					//display new entry
					sm_display.displayEntry(mUrl, mCredential);
					//dismiss modal
					require(['jquery'], function($) {
						$('#modal-newEntry').modal('toggle');
					});

				//console.log()
			}, onError);

			});

			
			
		},

		addEntry: function() {
			console.log("Function : addEntry");
			/* initialise variables */
			var inputCategoryDropdown = document.querySelectorAll('option:checked');
			var inputURL = document.querySelector('.url');
			var inputUsername = document.querySelector('.username');
			
			var entryCategory = inputCategoryDropdown[0].value;
			var entryURL = inputURL.value;
			var entryUsername = inputUsername.value;

			var gettingItem = browser.storage.local.get(entryURL);
			gettingItem.then((result) => {
				var objTest = Object.keys(result);
				if(objTest.length < 1 && entryURL !== '' && entryUsername !== '') {
					entryURL.value = ''; entryUsername.value = ''; entryCategory.value ='';

					var credential = {category: entryCategory, username: entryUsername};
					this.storeEntry(entryURL, credential);
					
					//var credential = entry.createEntry(entryURL, entryCategory, entryUsername, entryPassword);
					//var c = {category: credential.category, username: credential.username, password: credential.password};
					//this.storeEntry(credential.url, c);
				}
			}, onError);
			
		}

		
	}
});