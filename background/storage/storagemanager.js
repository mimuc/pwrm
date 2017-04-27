/* storagemanager */
define(["storage/sm_display", "entry"], function(sm_display, entry) {
	return {
		initialize: function() {
			console.log("Function : initialize");
			var gettingAllStorageItems = browser.storage.local.get(null);
			gettingAllStorageItems.then((results) => {
				var entryKeys = Object.keys(results);
				for(entryKey of entryKeys) {
					var curValue = results[entryKey];
					sm_display.displayEntry(entryKey,curValue);
				}
			}, onError);
		},

		storeEntry: function(mUrl, mCredential) {
			console.log("Function : storeEntry");
			var storingEntry = browser.storage.local.set({ [mUrl] : mCredential });
			
			storingEntry.then(() => {
				console.log("store success");
				sm_display.displayEntry(mUrl, mCredential);
				
				//console.log()
			}, onError);
			
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