/* Create JSON entry */

define(function() {
	return {
		createEntry: function(mUrl, mUsername, mPassword, mCategory) {
			console.log("Function : createEntry");
			var entry = {
				"url" : mUrl,				
				"username" : mUsername,
				"password" : mPassword,
				"category" : mCategory
			}
			return entry;
		}
	}
});