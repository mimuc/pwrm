/* storagemanager */
/* storage is logically split in "entries" and "categories" */
define(["storage/sm_display", "entry"], function(sm_display, entry) {
	return {
		initialize: function() {
			console.log("Function : initialize");

			//create distinct categories elements
			browser.storage.local.set({"categories" : {}});
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {
				console.log(Object.keys(results)); //categories
			});


			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var res = results["entries"];
				for(key in res){
					// TODO
					// display entries according to their categories 
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

				//console.log()
			}, onError);

			});

			
			
		},

		addEntry: function() {
			console.log("Function : addEntry");
			
			var entryCategory = inputCategory.value;
			var entryURL = inputURL.value;
			var entryUsername = inputUsername.value;
			var entryPassword = inputPassword.value;


			var gettingItem = browser.storage.local.get(entryURL);
			gettingItem.then((result) => {
				var objTest = Object.keys(result);
				if(objTest.length < 1 && entryURL !== '' && entryUsername !== '') {
					entryURL.value = ''; entryUsername.value = '';
					entryPassword.value = ''; entryCategory.value ='';

					var credential = {category: entryCategory, username: entryUsername, password: entryPassword};
					this.storeEntry(entryURL, credential);
					
					//var credential = entry.createEntry(entryURL, entryCategory, entryUsername, entryPassword);
					//var c = {category: credential.category, username: credential.username, password: credential.password};
					//this.storeEntry(credential.url, c);
				}
			}, onError);
			
		}

		
	}
});