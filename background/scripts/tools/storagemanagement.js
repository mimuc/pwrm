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
		getOnboardingMode: function(callback){
			browser.storage.local.get('mode').then((results) => {
				callback(results);
			});
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
		findEntries : function(value, callback){
			this.getEntries(function(results){
				console.log(results);
				var foundEntries = [];
				var entries = results["entries"];
				for(key in entries){
					var murl = entries[key].url;
					var mname = entries[key].username;
					// check if any entry contains the searched value as username/url
					if(murl.indexOf(value) !== -1 || mname.indexOf(value) !== -1){
						foundEntries.push(entries[key]);
					}
				}
				callback(foundEntries);
			});
		},
		findEntryByURL: function(mUrl, callback){
			this.getEntries(function(results){
				console.log(results);
				var entries = results["entries"];
				for(key in entries){
					if(entries[key].url == mUrl){
						callback(entries[key]);
					}
				}
			});
		},
		findEntryByUsername: function(name, callback){
			this.getEntries(function(results){
				console.log(results);
				var entries = results["entries"];
				for(key in entries){
					if(entries[key].username == name){
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
		// TOOD
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
		},
		createExtensionIdentifier : function(){
			require(['scripts/modules/Logger'], function(Logger){
				browser.storage.local.get('identifier').then((id) =>{
					var webexID;
					if(!id['identifier']){
						var rand = (""+Date.now()).substring(5);
						webexID = 'PWM-'+rand;
						browser.storage.local.set({'identifier' : webexID});
					}else{
						webexID = id['identifier'];
					}
				// display extensionIdentifier (fieldstudy mapping)
				$('#webexID').html(webexID);
				Logger.log({event: "Manager Installed", content: {'PWM-ID' : webexID}});
				Logger.log({event: "Manager Opened", content: navigator.userAgent});
			});
			});
		},
		getExtensionIdentifier : function(callback){
			browser.storage.local.get('identifier').then((id) =>{
				callback(id['identifier']);

			});
		}

	}
});