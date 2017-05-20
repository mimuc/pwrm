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

		loadEntries: function(categoryName){
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var res = results["entries"];
				//create empty entries-storage if empty
				//TODO
				if(res == null){
					storingEntry = browser.storage.local.set({"entries" : {}});
				}
				for(key in res){
					// TODO 3x		
					console.log("call display entry");
					if(res[key].category == categoryName){
						sm_display.displayEntry(key,res[key]);
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
					//display new entry
					//sm_display.displayEntry(mUrl, mCredential);
					sm_category.displayNumberEntries();


				//console.log()
			}, onError);

			});

			
			
		},

		addEntry: function() {
			console.log("Function : addEntry");
			/* initialise variables */
			
			var randID = tools.guidGenerator();
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

					var credential = {category: entryCategory, username: entryUsername, id: randID, password: "lala"};
					this.storeEntry(entryURL, credential);
					
					//var credential = entry.createEntry(entryURL, entryCategory, entryUsername, entryPassword);
					//var c = {category: credential.category, username: credential.username, password: credential.password};
					//this.storeEntry(credential.url, c);
				}
			}, onError);
			
		}

		
	}
});