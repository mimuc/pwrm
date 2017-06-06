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
		// todo
		},

		getCategories: function(callback){
		// todo
		},

		setEntries: function(value, callback){
		// todo
		},

		setCategories: function(value, callback){
		// todo
		}
}
});