/* get storage items */
define(function(){
	return{
		getMPWHash: function(callback){
			browser.storage.local.get('mpw').then((results) =>{
				callback(results);
			});
		},

		setMPWHash: function(value){
			var val = {"mpw" : CryptoJS.MD5(value)}
			browser.storage.local.set(val);
		},

		getEntries: function(callback){
		var gettingEntries = browser.storage.local.get("entries");
		gettingEntries.then((results) => {
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
		}
}
});