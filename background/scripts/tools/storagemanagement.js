/* get storage items */
define(function(){
	return{
		getMPWHash: function(callback){
			browser.storage.local.get('mpw').then((results) =>{
				callback(results);
			});
		},

		setMPWHash: function(value){
			var val = {"mpw" : CryptoJS.SHA512(value)}
			browser.storage.local.set(val);
		},

		getEntries: function(callback){
			console.log("SM : getEntries");
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				console.log(results);
				callback(results);
			});
		},

		getCategories: function(callback){
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {
				callback(results);
			});
		},

		setEntries: function(value, callback){
			console.log("SM : setEntries");
			var storingEntry = browser.storage.local.set(value);
			storingEntry.then(() => {
				callback();
			});
		},

		setCategories: function(value, callback){
			var storingCategory = browser.storage.local.set(value);
			storingCategory.then(()=> {
				callback();
			});
		},

		findEntryByURL: function(mUrl, callback){
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				console.log(results);
				var entries = results["entries"];
				for(key in entries){
					if(entries[key].url == mUrl){
						callback(entries[key]);
					}
				}
			});
		},

		// key (randID => pseudo unique!) -> credentials[url, name, ...]
		saveEntry: function(randID, credentials, callback){
			console.log("SM : saveEntry");
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var entries = results["entries"];
				entries[randID] = credentials;
				console.log(entries);
				var storingEntry = browser.storage.local.set({"entries" : entries});
				storingEntry.then(() => {
					callback();
				});

			});



		},
		countEntries : function(categories, callback){
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((eResults) => {
				var entries = eResults["entries"];
				var values = {};
				for(cKey in categories){
					var number = 0;
					for(key in entries){
						if(entries[key].category == cKey) number++;
					}
					values[cKey] = number;

				}

				callback(values);
			});
		}

	}
});